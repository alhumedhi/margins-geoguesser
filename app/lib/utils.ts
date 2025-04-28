import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class names with Tailwind's merge utility
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate score based on the distance between guess and actual location
 * @param actualCoords The actual coordinates of the item
 * @param guessCoords The guessed coordinates
 * @returns A score between 0 and 1000 (higher is better)
 */
export function calculateExponentialScore(
  actualCoords: { lat: number; lng: number },
  guessCoords: { lat: number; lng: number }
): number {
  // Calculate distance in kilometers using the Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (guessCoords.lat - actualCoords.lat) * Math.PI / 180;
  const dLng = (guessCoords.lng - actualCoords.lng) * Math.PI / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(actualCoords.lat * Math.PI / 180) * 
    Math.cos(guessCoords.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Maximum distance for scoring (effectively the Earth's diameter)
  const MAX_DISTANCE = 20000;
  
  // Calculate score with an exponential decay
  // Perfect score (1000) for 0 distance
  // Score approaches 0 as distance increases
  const normalizedDistance = Math.min(distance, MAX_DISTANCE) / MAX_DISTANCE;
  const score = Math.round(1000 * Math.exp(-5 * normalizedDistance));
  
  return score;
}

/**
 * Calculate score based on the distance between guess and actual location
 * @param guessLat The guessed latitude
 * @param guessLng The guessed longitude
 * @param actualLat The actual latitude
 * @param actualLng The actual longitude
 * @returns A score between 0 and 1000 (higher is better)
 */
export function calculateScore(
  guessLat: number,
  guessLng: number,
  actualLat: number,
  actualLng: number
): number {
  // Calculate distance in kilometers using the Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (actualLat - guessLat) * Math.PI / 180;
  const dLng = (actualLng - guessLng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(guessLat * Math.PI / 180) * 
    Math.cos(actualLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Calculate score based on distance
  // Maximum score (1000) for exact match
  // Score decreases exponentially with distance
  const maxScore = 1000;
  const decayFactor = 0.1; // Adjust this to control how quickly score decreases with distance
  const score = Math.round(maxScore * Math.exp(-decayFactor * distance));

  return Math.max(0, Math.min(1000, score));
}

/**
 * Format a number as a score with commas
 */
export function formatScore(score: number): string {
  return score.toFixed(0);
}

/**
 * Get color based on the score (red to green gradient)
 */
export function getScoreColor(score: number): string {
  if (score >= 900) return 'text-green-500';
  if (score >= 700) return 'text-green-400';
  if (score >= 500) return 'text-yellow-500';
  if (score >= 300) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} meters`;
  }
  return `${distance.toFixed(1)} km`;
}

/**
 * Format time for display
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 