import { ID, Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID, USER_PROFILES_TABLE_ID } from './config';
import type { ReviewData, ReviewRow } from './types';
import { createUserNotification } from './userNotifications';
import { fetchTiers, getUserCurrentTier } from './tiers';

export const REVIEWS_TABLE_ID = process.env.APPWRITE_REVIEWS_TABLE_ID || 'reviews';

export const createReview = async (reviewData: ReviewData): Promise<ReviewRow> => {
  if (!DATABASE_ID || !REVIEWS_TABLE_ID || !USER_PROFILES_TABLE_ID) {
    throw new Error('Database ID or Table ID not configured.');
  }

  try {
    const existing = await getUserReviewForEvent(reviewData.user, reviewData.event);
    if (existing) {
      throw new Error('You have already reviewed this event');
    }
    
    const userProfile = await tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: USER_PROFILES_TABLE_ID,
      rowId: reviewData.user,
    });

    if (!userProfile) {
      throw new Error('User profile not found');
    }
    
    const profile = userProfile as any;
    const oldTotalPoints = profile.totalPoints || 0;
    const newTotalReviews = (profile.totalReviews || 0) + 1;
    const newTotalPoints = oldTotalPoints + (reviewData.pointsEarned || 0);

    const authUserID = profile.authID;
    if (!authUserID) {
      throw new Error('User authentication ID not found in profile');
    }

    // Get current tier before updating points
    let oldTier = null;
    try {
      const tiers = await fetchTiers();
      oldTier = getUserCurrentTier(tiers, oldTotalPoints);
    } catch (error) {
      console.error('[reviews] Failed to fetch tiers:', error);
    }

    const rowId = ID.unique();
    const result = await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: REVIEWS_TABLE_ID,
      rowId: rowId,
      data: reviewData,
      permissions: [
        `read("user:${authUserID}")`,
        `update("user:${authUserID}")`,
        `delete("user:${authUserID}")`,
      ],
    });

    await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: USER_PROFILES_TABLE_ID,
      rowId: profile.$id,
      data: {
        totalReviews: newTotalReviews,
        totalPoints: newTotalPoints,
      },
    });

    // Create review confirmation notification
    try {
      await createUserNotification({
        userId: authUserID,
        type: 'review',
        title: 'Thank You for Your Review! ⭐',
        message: `You earned ${reviewData.pointsEarned || 0} points! Your feedback helps others discover great products.`,
        data: {
          eventId: reviewData.event,
          pointsEarned: reviewData.pointsEarned || 0,
          rating: reviewData.rating,
        },
      });
    } catch (notificationError) {
      console.error('[reviews] Failed to create review notification:', notificationError);
      // Don't fail the review if notification creation fails
    }

    // Check if tier changed and create notification
    try {
      const tiers = await fetchTiers();
      const newTier = getUserCurrentTier(tiers, newTotalPoints);
      if (newTier && oldTier && newTier.$id !== oldTier.$id) {
        await createUserNotification({
          userId: authUserID,
          type: 'tierChanged',
          title: `Congratulations! You're now ${newTier.name}! 🎊`,
          message: `You've unlocked new rewards and benefits. Keep sampling to reach the next tier!`,
          data: {
            oldTierId: oldTier.$id,
            newTierId: newTier.$id,
            oldTierName: oldTier.name,
            newTierName: newTier.name,
          },
        });
      }
    } catch (tierError) {
      console.error('[reviews] Failed to check tier or create tier notification:', tierError);
      // Don't fail the review if tier notification fails
    }
    
    return {
      $id: result.$id,
      user: result.user,
      event: result.event,
      review: result.review,
      rating: result.rating,
      liked: result.liked,
      hasPurchased: result.hasPurchased,
      pointsEarned: result.pointsEarned,
      $createdAt: result.$createdAt,
      $updatedAt: result.$updatedAt,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create review');
  }
};

export const getUserReviews = async (userID: string): Promise<ReviewRow[]> => {
  if (!DATABASE_ID || !REVIEWS_TABLE_ID) {
    throw new Error('Database ID or Reviews Table ID not configured.');
  }

  try {
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: REVIEWS_TABLE_ID,
      queries: [Query.equal('user', userID)],
    });

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    return result.rows.map((row: any) => ({
      $id: row.$id,
      user: row.user,
      event: row.event,
      review: row.review,
      rating: row.rating,
      liked: row.liked,
      hasPurchased: row.hasPurchased,
      pointsEarned: row.pointsEarned,
      $createdAt: row.$createdAt,
      $updatedAt: row.$updatedAt,
    }));
  } catch (error: any) {
    if (error.code === 404 || error.message?.includes('not found')) {
      return [];
    }
    throw new Error(error.message || 'Failed to fetch reviews');
  }
};

export const getUserReviewForEvent = async (
  userID: string,
  eventID: string
): Promise<ReviewRow | null> => {
  if (!DATABASE_ID || !REVIEWS_TABLE_ID) {
    throw new Error('Database ID or Reviews Table ID not configured.');
  }

  try {
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: REVIEWS_TABLE_ID,
      queries: [Query.equal('user', userID), Query.equal('event', eventID)],
    });

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      $id: row.$id,
      user: row.user,
      event: row.event,
      review: row.review,
      rating: row.rating,
      liked: row.liked,
      hasPurchased: row.hasPurchased,
      pointsEarned: row.pointsEarned,
      $createdAt: row.$createdAt,
      $updatedAt: row.$updatedAt,
    };
  } catch (error: any) {
    if (error.code === 404 || error.message?.includes('not found')) {
      return null;
    }
    throw new Error(error.message || 'Failed to check review status');
  }
};

export const getUserReviewsCount = async (userID: string): Promise<number> => {
  try {
    const reviews = await getUserReviews(userID);
    return reviews.length;
  } catch (error: any) {
    return 0;
  }
};

export const getEventReviews = async (eventID: string): Promise<ReviewRow[]> => {
  if (!DATABASE_ID || !REVIEWS_TABLE_ID) {
    throw new Error('Database ID or Reviews Table ID not configured.');
  }

  try {
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: REVIEWS_TABLE_ID,
      queries: [Query.equal('event', eventID)],
    });

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    return result.rows.map((row: any) => ({
      $id: row.$id,
      user: row.user,
      event: row.event,
      review: row.review,
      rating: row.rating,
      liked: row.liked,
      hasPurchased: row.hasPurchased,
      pointsEarned: row.pointsEarned,
      $createdAt: row.$createdAt,
      $updatedAt: row.$updatedAt,
    }));
  } catch (error: any) {
    if (error.code === 404 || error.message?.includes('not found')) {
      return [];
    }
    throw new Error(error.message || 'Failed to fetch event reviews');
  }
};

