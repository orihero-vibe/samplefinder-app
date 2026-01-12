import { ID, Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID, USER_PROFILES_TABLE_ID } from './config';
import type { CheckInData, CheckInRow } from './types';

export const CHECK_INS_TABLE_ID = process.env.APPWRITE_CHECK_INS_TABLE_ID || 'checkins';

export const createCheckIn = async (checkInData: CheckInData): Promise<CheckInRow> => {
  if (!DATABASE_ID || !CHECK_INS_TABLE_ID || !USER_PROFILES_TABLE_ID) {
    throw new Error('Database ID or Table ID not configured.');
  }

  try {
    const existing = await getUserCheckInForEvent(checkInData.userID, checkInData.eventID);
    if (existing) {
      throw new Error('You have already checked in to this event');
    }
    
    const userProfile = await tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: USER_PROFILES_TABLE_ID,
      rowId: checkInData.userID,
    });

    if (!userProfile) {
      throw new Error('User profile not found');
    }
    
    const profile = userProfile as any;
    const newTotalEvents = (profile.totalEvents || 0) + 1;
    const newTotalPoints = (profile.totalPoints || 0) + checkInData.pointsEarned;

    const authUserID = profile.authID;
    if (!authUserID) {
      throw new Error('User authentication ID not found in profile');
    }

    const rowId = ID.unique();
    const result = await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: CHECK_INS_TABLE_ID,
      rowId: rowId,
      data: checkInData,
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
        totalEvents: newTotalEvents,
        totalPoints: newTotalPoints,
      },
    });
    
    return {
      $id: result.$id,
      userID: result.userID,
      eventID: result.eventID,
      checkInCode: result.checkInCode,
      pointsEarned: result.pointsEarned,
      $createdAt: result.$createdAt,
      $updatedAt: result.$updatedAt,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create check-in');
  }
};

export const getUserCheckIns = async (userID: string): Promise<CheckInRow[]> => {
  if (!DATABASE_ID || !CHECK_INS_TABLE_ID) {
    throw new Error('Database ID or Check-ins Table ID not configured.');
  }

  try {
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: CHECK_INS_TABLE_ID,
      queries: [Query.equal('userID', userID)],
    });

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    return result.rows.map((row: any) => ({
      $id: row.$id,
      userID: row.userID,
      eventID: row.eventID,
      checkInCode: row.checkInCode,
      pointsEarned: row.pointsEarned,
      $createdAt: row.$createdAt,
      $updatedAt: row.$updatedAt,
    }));
  } catch (error: any) {
    if (error.code === 404 || error.message?.includes('not found')) {
      return [];
    }
    throw new Error(error.message || 'Failed to fetch check-ins');
  }
};

export const getUserCheckInForEvent = async (
  userID: string,
  eventID: string
): Promise<CheckInRow | null> => {
  if (!DATABASE_ID || !CHECK_INS_TABLE_ID) {
    throw new Error('Database ID or Check-ins Table ID not configured.');
  }

  try {
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: CHECK_INS_TABLE_ID,
      queries: [Query.equal('userID', userID), Query.equal('eventID', eventID)],
    });

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      $id: row.$id,
      userID: row.userID,
      eventID: row.eventID,
      checkInCode: row.checkInCode,
      pointsEarned: row.pointsEarned,
      $createdAt: row.$createdAt,
      $updatedAt: row.$updatedAt,
    };
  } catch (error: any) {
    if (error.code === 404 || error.message?.includes('not found')) {
      return null;
    }
    throw new Error(error.message || 'Failed to check check-in status');
  }
};

export const getUserCheckInsCount = async (userID: string): Promise<number> => {
  try {
    const checkIns = await getUserCheckIns(userID);
    return checkIns.length;
  } catch (error: any) {
    return 0;
  }
};

