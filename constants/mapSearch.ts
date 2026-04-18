/** Geo radius for worker search (meters). Must match server default when omitted. */
export const MAP_SEARCH_RADIUS_METERS = 10000;

/** Page size for initial home load and each map-region fetch. */
export const MAP_SEARCH_PAGE_LIMIT = 80;

/** Debounce for map region changes (ms). */
export const MAP_REGION_FETCH_DEBOUNCE_MS = 450;

/**
 * Quantize lat/lng for "already fetched this cell" deduplication.
 * ~0.008° latitude ≈ 0.9 km at the equator; adjust if needed.
 */
export const MAP_FETCH_GRID_STEP_DEG = 0.008;

/** Initial map zoom when centering on the user (neighborhood scale). */
export const HOME_MAP_INITIAL_LATITUDE_DELTA = 0.05;
export const HOME_MAP_INITIAL_LONGITUDE_DELTA = 0.05;

export function mapFetchCellKey(lat: number, lng: number): string {
    const qLat = Math.round(lat / MAP_FETCH_GRID_STEP_DEG) * MAP_FETCH_GRID_STEP_DEG;
    const qLng = Math.round(lng / MAP_FETCH_GRID_STEP_DEG) * MAP_FETCH_GRID_STEP_DEG;
    return `${qLat.toFixed(5)},${qLng.toFixed(5)}`;
}
