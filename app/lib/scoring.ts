export function calculateExponentialScore(
  actualCoords: { lat: number; lng: number },
  guessCoords: { lat: number; lng: number }
): number {
  const EARTH_DIAGONAL_KM = 20000; // Approximate diagonal distance of the Earth in km
  
  // Calculate distance using Haversine formula instead of relying on geolib
  const distance = calculateHaversineDistance(actualCoords, guessCoords);
  const score = 5000 * Math.exp((-10 * distance) / EARTH_DIAGONAL_KM);
  return Math.round(score);
}

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param point1 First coordinate {lat, lng}
 * @param point2 Second coordinate {lat, lng}
 * @returns Distance in kilometers
 */
function calculateHaversineDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
} 