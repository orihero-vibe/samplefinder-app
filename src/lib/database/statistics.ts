import { DATABASE_ID, USER_PROFILES_TABLE_ID } from './config';
import type { UserStatistics } from './types';

/**
 * Get user statistics (points, check-ins, reviews, badges)
 * NOTE: This function requires the following database tables/fields:
 * - User Check-ins table (or checkIns field in UserProfile)
 * - User Reviews table (or reviews field in UserProfile)
 * - User Badges table (or badges field in UserProfile)
 * - User Points table (or totalPoints field in UserProfile)
 * 
 * Currently returns default values until these tables are created.
 */
export const getUserStatistics = async (authID: string): Promise<UserStatistics> => {
  console.log('[database.getUserStatistics] Fetching user statistics for authID:', authID);

  // Validate environment variables
  if (!DATABASE_ID || !USER_PROFILES_TABLE_ID) {
    const errorMsg = 'Database ID or Table ID not configured. Please check your .env file.';
    console.error('[database.getUserStatistics]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // TODO: Implement actual queries once these tables/fields exist:
    // - Query user check-ins table filtered by authID
    // - Query user reviews table filtered by authID
    // - Query user badges table filtered by authID
    // - Get total points from user points table or user profile
    
    // For now, return default values
    // In production, you would:
    // 1. Query check-ins: tablesDB.listRows({ tableId: 'user_checkins', queries: [Query.equal('authID', authID)] })
    // 2. Query reviews: tablesDB.listRows({ tableId: 'user_reviews', queries: [Query.equal('authID', authID)] })
    // 3. Query badges: tablesDB.listRows({ tableId: 'user_badges', queries: [Query.equal('authID', authID)] })
    // 4. Get points: from user profile or points table
    
    const stats: UserStatistics = {
      totalPoints: 0,
      eventCheckIns: 0,
      samplingReviews: 0,
      badgeAchievements: 0,
    };

    console.log('[database.getUserStatistics] Returning default statistics:', stats);
    console.warn('[database.getUserStatistics] WARNING: Using default values. Database tables for check-ins, reviews, badges, and points need to be created.');
    
    return stats;
  } catch (error: any) {
    console.error('[database.getUserStatistics] Error fetching user statistics:', error);
    console.error('[database.getUserStatistics] Error message:', error?.message);
    console.error('[database.getUserStatistics] Error code:', error?.code);
    
    // Return default values on error
    return {
      totalPoints: 0,
      eventCheckIns: 0,
      samplingReviews: 0,
      badgeAchievements: 0,
    };
  }
};

/**
 * Calculate user tier status based on points or activity
 * Tier levels can be:
 * - NewbieSampler: 0-999 points
 * - ActiveSampler: 1000-4999 points
 * - ProSampler: 5000-9999 points
 * - EliteSampler: 10000+ points
 */
export const calculateTierStatus = (points: number): string => {
  if (points >= 10000) {
    return 'EliteSampler';
  } else if (points >= 5000) {
    return 'ProSampler';
  } else if (points >= 1000) {
    return 'ActiveSampler';
  } else {
    return 'NewbieSampler';
  }
};

