/**
 * Badge Configuration Constants
 * 
 * Defines the thresholds for earning badges based on user activities
 */

// Badge thresholds for both event check-ins and reviews
export const BADGE_THRESHOLDS = [10, 25, 50, 100, 250];

/**
 * Helper function to get the last achieved badge count
 * @param count - The current count (events or reviews)
 * @returns The highest badge threshold achieved, or null if none
 */
export const getLastAchievedBadge = (count: number): number | null => {
  // Find the highest threshold that the user has achieved
  for (let i = BADGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (count >= BADGE_THRESHOLDS[i]) {
      return BADGE_THRESHOLDS[i];
    }
  }
  return null;
};

/**
 * Helper function to count total achieved badges
 * @param count - The current count (events or reviews)
 * @returns The number of badges achieved
 */
export const countAchievedBadges = (count: number): number => {
  return BADGE_THRESHOLDS.filter(threshold => count >= threshold).length;
};
