const EARTH_RADIUS_M = 6371000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine distance in meters between two WGS84 points.
 */
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

/**
 * @param coords GeoJSON-style [lng, lat] as stored on {@link Worker}
 */
export function distanceMetersFromUser(
  userLat: number,
  userLng: number,
  coords: [number, number],
): number {
  const [lng, lat] = coords;
  return haversineDistanceMeters(userLat, userLng, lat, lng);
}

export function formatDistanceMeters(meters: number): string {
  if (!Number.isFinite(meters)) {
    return '—';
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
