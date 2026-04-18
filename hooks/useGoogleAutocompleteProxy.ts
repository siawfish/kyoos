import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isCancel } from 'axios';
import axios from '@/services/axios';

export type GoogleLocationResult = {
  description: string;
  place_id: string;
  reference?: string;
  matched_substrings?: {
    length: number;
    offset: number;
  }[];
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
    main_text_matched_substrings?: {
      length: number;
      offset: number;
    }[];
  };
  terms?: {
    offset: number;
    value: string;
  }[];
  types?: string[];
};

export type GoogleLocationDetailResult = {
  place_id: string;
  formatted_address: string;
  name?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components?: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
};

type Options = {
  /** Minimum length of the input before start fetching - default: 2 */
  minLength?: number;
  /** Debounce request time in ms - default: 300 */
  debounce?: number;
  /** Language for Google query - default: en */
  language?: string;
  /** A grouping of places to which you would like to restrict your results (e.g. `country:gh`). */
  components?: string;
  /** See https://developers.google.com/places/web-service/autocomplete#place_types - default: address */
  types?: string;
};

// RFC4122 v4 UUID generator. Avoids pulling in an extra dep just for a
// session token; the token just needs to be an opaque stable string.
const generateSessionToken = (): string => {
  const rand = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  const variant = ((Math.random() * 0x4) | 0x8).toString(16);
  return `${rand()}${rand()}-${rand()}-4${rand().slice(1)}-${variant}${rand().slice(1)}-${rand()}${rand()}${rand()}`;
};

export const useGoogleAutocompleteProxy = (opts: Options = {}) => {
  const {
    minLength = 2,
    debounce = 300,
    language = 'en',
    components,
    types = 'address',
  } = opts;

  const [term, setTerm] = useState('');
  const [locationResults, setLocationResults] = useState<GoogleLocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<Error | null>(null);

  const sessionTokenRef = useRef<string>(generateSessionToken());
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const runSearch = useCallback(async (value: string) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await axios.get<{ message: string; data: GoogleLocationResult[] }>(
        '/api/google/placesAutocomplete',
        {
          params: {
            input: value,
            language,
            components,
            types,
            sessiontoken: sessionTokenRef.current,
          },
          signal: controller.signal,
        }
      );

      if (!isMountedRef.current || controller.signal.aborted) return;
      setLocationResults(response.data?.data || []);
    } catch (error: any) {
      if (isCancel(error) || error?.name === 'CanceledError' || error?.name === 'AbortError') {
        return;
      }
      if (!isMountedRef.current) return;
      const message =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to fetch locations';
      setSearchError(new Error(message));
      setLocationResults([]);
    } finally {
      if (isMountedRef.current && abortRef.current === controller) {
        setIsSearching(false);
      }
    }
  }, [language, components, types]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (term.length < minLength) {
      setLocationResults([]);
      setIsSearching(false);
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    debounceRef.current = setTimeout(() => {
      runSearch(term);
    }, debounce);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [term, minLength, debounce, runSearch]);

  const searchDetails = useCallback(async (placeId: string): Promise<GoogleLocationDetailResult> => {
    try {
      const response = await axios.get<{ message: string; data: GoogleLocationDetailResult }>(
        `/api/google/placeDetails/${encodeURIComponent(placeId)}`,
        {
          params: {
            language,
            sessiontoken: sessionTokenRef.current,
          },
        }
      );

      // Google billing best practice: rotate session token after a details call.
      sessionTokenRef.current = generateSessionToken();

      return response.data.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to fetch place details';
      throw new Error(message);
    }
  }, [language]);

  const clearSearch = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setLocationResults([]);
    setIsSearching(false);
  }, []);

  return useMemo(
    () => ({
      locationResults,
      isSearching,
      searchError,
      setTerm,
      term,
      searchDetails,
      clearSearch,
    }),
    [locationResults, isSearching, searchError, term, searchDetails, clearSearch]
  );
};

export default useGoogleAutocompleteProxy;
