import { ID } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID, USER_PROFILES_TABLE_ID } from './config';
import { getUserProfile } from './users';
import type { UserNotification, NotificationType } from './types';
import { sendPushNotification } from '../pushNotifications';

/**
 * User Notifications Module
 * Stores notifications as JSON array in user profile
 * No separate collection needed - simpler and faster!
 * 
 * Note: Notifications are serialized as JSON strings in Appwrite
 * because the database stores them as an array of strings.
 */

const MAX_NOTIFICATIONS = 50; // Keep last 50 notifications per user

/**
 * Helper: Deserialize notifications from database format (JSON strings) to objects
 */
const deserializeNotifications = (notificationsRaw: any[]): UserNotification[] => {
  return notificationsRaw.map((n: any) => {
    if (typeof n === 'string') {
      try {
        return JSON.parse(n);
      } catch {
        return null;
      }
    }
    return n;
  }).filter((n: any) => n !== null);
};

/**
 * Helper: Serialize notifications to database format (JSON strings)
 */
const serializeNotifications = (notifications: UserNotification[]): string[] => {
  return notifications.map(n => JSON.stringify(n));
};

export type { NotificationType, UserNotification } from './types';

export interface UserNotificationData {
  userId: string; // User authID
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Create a user notification (stored in user profile)
 */
export const createUserNotification = async (
  notificationData: UserNotificationData
): Promise<UserNotification> => {
  if (!DATABASE_ID || !USER_PROFILES_TABLE_ID) {
    throw new Error('Database ID or User Profiles Table ID not configured.');
  }

  try {
    console.log('[notifications] Creating notification:', notificationData);

    // Get user profile
    const profile = await getUserProfile(notificationData.userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Get existing notifications or initialize empty array
    const existingNotificationsRaw = (profile as any).notifications || [];
    const existingNotifications = deserializeNotifications(existingNotificationsRaw);

    // Create new notification
    const newNotification: UserNotification = {
      id: ID.unique(),
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      isRead: false,
      createdAt: new Date().toISOString(),
      data: notificationData.data || {},
    };

    // Add to beginning of array (newest first)
    const updatedNotifications = [newNotification, ...existingNotifications];

    // Keep only last MAX_NOTIFICATIONS
    if (updatedNotifications.length > MAX_NOTIFICATIONS) {
      updatedNotifications.splice(MAX_NOTIFICATIONS);
    }

    // Serialize notifications to JSON strings for storage
    const serializedNotifications = serializeNotifications(updatedNotifications);

    // Update user profile
    await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: USER_PROFILES_TABLE_ID,
      rowId: profile.$id,
      data: {
        notifications: serializedNotifications,
      },
    });

    console.log('[notifications] Notification created successfully');

    // Send push notification (respects user preferences)
    try {
      // Check if user has push notifications enabled
      const notificationPreferences = (profile as any).notificationPreferences || {};
      const pushEnabled = notificationPreferences.enablePushNotifications !== false; // Default to true

      if (pushEnabled) {
        console.log('[notifications] Sending push notification to user:', notificationData.userId);
        
        // Convert data to string-only record for push notification
        const stringData: Record<string, string> = {};
        if (notificationData.data) {
          Object.entries(notificationData.data).forEach(([key, value]) => {
            stringData[key] = String(value);
          });
        }

        await sendPushNotification({
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: stringData,
        });
      } else {
        console.log('[notifications] Push notifications disabled for user:', notificationData.userId);
      }
    } catch (pushError: any) {
      // Log push error but don't fail the notification creation
      console.error('[notifications] Failed to send push notification:', pushError);
    }

    return newNotification;
  } catch (error: any) {
    console.error('[notifications] Error creating notification:', error);
    throw new Error(error.message || 'Failed to create notification');
  }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (
  userId: string,
  limit: number = 20
): Promise<UserNotification[]> => {
  try {
    console.log('[notifications] Fetching notifications for user:', userId);

    const profile = await getUserProfile(userId);
    if (!profile) {
      return [];
    }

    const notificationsRaw = (profile as any).notifications || [];
    const notifications = deserializeNotifications(notificationsRaw);
    
    // Return limited number
    return notifications.slice(0, limit);
  } catch (error: any) {
    console.error('[notifications] Error fetching notifications:', error);
    return [];
  }
};

/**
 * Get unread user notifications
 */
export const getUnreadNotifications = async (
  userId: string,
  limit: number = 10
): Promise<UserNotification[]> => {
  try {
    console.log('[notifications] Fetching unread notifications for user:', userId);

    const allNotifications = await getUserNotifications(userId, 100);
    const unreadNotifications = allNotifications.filter((notif) => !notif.isRead);

    return unreadNotifications.slice(0, limit);
  } catch (error: any) {
    console.error('[notifications] Error fetching unread notifications:', error);
    return [];
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  userId: string,
  notificationId: string
): Promise<void> => {
  if (!DATABASE_ID || !USER_PROFILES_TABLE_ID) {
    throw new Error('Database ID or User Profiles Table ID not configured.');
  }

  try {
    console.log('[notifications] Marking notification as read:', notificationId);

    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const notificationsRaw = (profile as any).notifications || [];
    const notifications = deserializeNotifications(notificationsRaw);
    
    // Find and update the notification
    const updatedNotifications = notifications.map((notif: UserNotification) =>
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    );

    // Serialize back to JSON strings
    const serializedNotifications = serializeNotifications(updatedNotifications);

    // Update user profile
    await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: USER_PROFILES_TABLE_ID,
      rowId: profile.$id,
      data: {
        notifications: serializedNotifications,
      },
    });

    console.log('[notifications] Notification marked as read');
  } catch (error: any) {
    console.error('[notifications] Error marking notification as read:', error);
    throw new Error(error.message || 'Failed to mark notification as read');
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  if (!DATABASE_ID || !USER_PROFILES_TABLE_ID) {
    throw new Error('Database ID or User Profiles Table ID not configured.');
  }

  try {
    console.log('[notifications] Marking all notifications as read for user:', userId);

    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const notificationsRaw = (profile as any).notifications || [];
    const notifications = deserializeNotifications(notificationsRaw);
    
    // Mark all as read
    const updatedNotifications = notifications.map((notif: UserNotification) => ({
      ...notif,
      isRead: true,
    }));

    // Serialize back to JSON strings
    const serializedNotifications = serializeNotifications(updatedNotifications);

    // Update user profile
    await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: USER_PROFILES_TABLE_ID,
      rowId: profile.$id,
      data: {
        notifications: serializedNotifications,
      },
    });

    console.log('[notifications] All notifications marked as read');
  } catch (error: any) {
    console.error('[notifications] Error marking all notifications as read:', error);
    throw new Error(error.message || 'Failed to mark all notifications as read');
  }
};

/**
 * Delete a notification
 */
export const deleteUserNotification = async (
  userId: string,
  notificationId: string
): Promise<void> => {
  if (!DATABASE_ID || !USER_PROFILES_TABLE_ID) {
    throw new Error('Database ID or User Profiles Table ID not configured.');
  }

  try {
    console.log('[notifications] Deleting notification:', notificationId);

    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const notificationsRaw = (profile as any).notifications || [];
    const notifications = deserializeNotifications(notificationsRaw);
    
    // Filter out the notification
    const updatedNotifications = notifications.filter(
      (notif: UserNotification) => notif.id !== notificationId
    );

    // Serialize back to JSON strings
    const serializedNotifications = serializeNotifications(updatedNotifications);

    // Update user profile
    await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: USER_PROFILES_TABLE_ID,
      rowId: profile.$id,
      data: {
        notifications: serializedNotifications,
      },
    });

    console.log('[notifications] Notification deleted');
  } catch (error: any) {
    console.error('[notifications] Error deleting notification:', error);
    throw new Error(error.message || 'Failed to delete notification');
  }
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const unreadNotifications = await getUnreadNotifications(userId, 100);
    return unreadNotifications.length;
  } catch (error: any) {
    console.error('[notifications] Error getting unread count:', error);
    return 0;
  }
};

/**
 * Clear all notifications for a user
 */
export const clearAllNotifications = async (userId: string): Promise<void> => {
  if (!DATABASE_ID || !USER_PROFILES_TABLE_ID) {
    throw new Error('Database ID or User Profiles Table ID not configured.');
  }

  try {
    console.log('[notifications] Clearing all notifications for user:', userId);

    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Update user profile with empty notifications array
    await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: USER_PROFILES_TABLE_ID,
      rowId: profile.$id,
      data: {
        notifications: [],
      },
    });

    console.log('[notifications] All notifications cleared');
  } catch (error: any) {
    console.error('[notifications] Error clearing notifications:', error);
    throw new Error(error.message || 'Failed to clear notifications');
  }
};
