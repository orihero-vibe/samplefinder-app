import { DATABASE_ID, USER_PROFILES_TABLE_ID } from './config';
import type { UserStatistics } from './types';
import { getUserProfile } from './users';
import { getUserCheckInsCount } from './checkIns';
import { getUserReviewsCount } from './reviews';

export const getUserStatistics = async (authID: string): Promise<UserStatistics> => {
  if (!DATABASE_ID || !USER_PROFILES_TABLE_ID) {
    throw new Error('Database ID or Table ID not configured. Please check your .env file.');
  }

  try {
    const profile = await getUserProfile(authID);
    if (!profile) {
      return {
        totalPoints: 0,
        eventCheckIns: 0,
        samplingReviews: 0,
        badgeAchievements: 0,
      };
    }
    
    // Use profile.$id (row ID) for querying check-ins and reviews
    const eventCheckInsCount = await getUserCheckInsCount(profile.$id);
    const reviewsCount = await getUserReviewsCount(profile.$id);
    
    return {
      totalPoints: profile?.totalPoints || 0,
      eventCheckIns: eventCheckInsCount,
      samplingReviews: reviewsCount,
      badgeAchievements: 0,
    };
  } catch (error: any) {
    return {
      totalPoints: 0,
      eventCheckIns: 0,
      samplingReviews: 0,
      badgeAchievements: 0,
    };
  }
};

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

