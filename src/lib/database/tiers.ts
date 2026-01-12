import { Query } from 'react-native-appwrite';
import { DATABASE_ID, TIERS_TABLE_ID, tablesDB } from './config';
import type { TierRow } from './types';

/**
 * Fetch all tiers ordered by their order field
 */
export const fetchTiers = async (): Promise<TierRow[]> => {
  if (!DATABASE_ID || !TIERS_TABLE_ID) {
    throw new Error('Database ID or Tiers Table ID not configured. Please check your .env file.');
  }

  try {
    const response = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TIERS_TABLE_ID,
      queries: [Query.orderAsc('order')]
    });

    return response.rows as unknown as TierRow[];
  } catch (error: any) {
    console.error('Error fetching tiers:', error);
    throw error;
  }
};

/**
 * Get user's current tier based on their total points
 */
export const getUserCurrentTier = (tiers: TierRow[], totalPoints: number): TierRow | null => {
  if (!tiers.length) return null;

  // Sort by requiredPoints descending to find highest achieved tier
  const sortedTiers = [...tiers].sort((a, b) => b.requiredPoints - a.requiredPoints);
  
  for (const tier of sortedTiers) {
    if (totalPoints >= tier.requiredPoints) {
      return tier;
    }
  }

  // Return first tier if user hasn't reached any
  return tiers[0];
};

/**
 * Get user's next tier (the one they're working towards)
 */
export const getUserNextTier = (tiers: TierRow[], totalPoints: number): TierRow | null => {
  if (!tiers.length) return null;

  // Sort by requiredPoints ascending
  const sortedTiers = [...tiers].sort((a, b) => a.requiredPoints - b.requiredPoints);
  
  for (const tier of sortedTiers) {
    if (totalPoints < tier.requiredPoints) {
      return tier;
    }
  }

  // User has achieved all tiers
  return null;
};
