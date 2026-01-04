import { Media } from '@/redux/app/types';
import { SearchState, Summary, Worker } from '@/redux/search/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

// The initial state of the GithubRepoForm container
export const initialState: SearchState = {
  isInitializing: false,
  isLoading: false,
  search: '',
  media: [],
  summary: {
    estimatedDuration: 0,
    requiredSkills: [],
    requiredTools: [],
    estimatedPrice: '',
    reasoning: '',
  },
  recommendedWorkers: [],
  closestWorkers: [],
  nearestWorkers: [],
  totalNearbyWorkers: 0,
  searchReferenceId: '',
  isUpdatingLocation: false,
}

interface RehydrateAction {
  type: typeof REHYDRATE;
  key: string;
  payload: {
    search?: SearchState;
  };
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    onInitialize: (state, action: PayloadAction<{lat: number, lng: number}>) => {
      state.isInitializing = true;
    },
    onInitializeCompleted: (state) => {
      state.isInitializing = false;
    },
    setNearestWorkers: (state, action: PayloadAction<{workers: Worker[], total: number}>) => {
      state.nearestWorkers = action.payload.workers;
      state.totalNearbyWorkers = action.payload.total;
    },
    onSearch: (state) => {
      state.isLoading = true;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setMedia: (state, action: PayloadAction<Media[]>) => {
      state.media = action.payload;
    },
    setSummary: (state, action: PayloadAction<Summary>) => {
      state.summary = action.payload;
    },
    setRecommendedWorkers: (state, action: PayloadAction<Worker[]>) => {
      state.recommendedWorkers = action.payload;
    },
    setClosestWorkers: (state, action: PayloadAction<Worker[]>) => {
      state.closestWorkers = action.payload;
    },
    setSearchReferenceId: (state, action: PayloadAction<string>) => {
      state.searchReferenceId = action.payload;
    },
    saveUserLocation: (state) => {
      state.isUpdatingLocation = true;
    },
    resetState: (state) => {
      return {
        ...initialState,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      // Handle rehydration explicitly
      if (action.payload?.search) {
        return {
          ...state,
          ...action.payload.search
        };
      }
      return state;
    });
  }
});

export const {actions, reducer, name: sliceKey} = searchSlice;
