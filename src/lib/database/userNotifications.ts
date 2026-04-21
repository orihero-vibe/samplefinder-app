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

// Dedup window: ignore duplicate notifications created within this period
const DEDUP_WINDOW_MS = 30_000;
// Badge notifications use a longer window because FCM push delivery can be delayed
// by hours (Doze mode, battery optimization) and the push handler must not re-create
// a notification that already exists.
const BADGE_DEDUP_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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

/** Same visible row = same title and body, regardless of type (handles legacy 'Engagement' entries). */
const notificationDisplayFingerprint = (n: UserNotification): string =>
  `${n.title}\0${n.message}`;

/**
 * Drop duplicate rows: repeated ids, same type/title/message with different ids,
 * or multiple badge notifications for the same badgeType (keep newest, i.e. first
 * in the newest-first list). This handles legacy 'Engagement'-type entries that
 * were created before the backend switched to 'badgeEarned'.
 */
const dedupeStoredNotificationsForDisplay = (
  notifications: UserNotification[]
): UserNotification[] => {
  const seenIds = new Set<string>();
  const seenFingerprints = new Set<string>();
  const seenBadgeTypes = new Set<string>();
  const out: UserNotification[] = [];

  for (const n of notifications) {
    if (!n?.id) {
      continue;
    }
    if (seenIds.has(n.id)) {
      continue;
    }
    const fp = notificationDisplayFingerprint(n);
    if (seenFingerprints.has(fp)) {
      continue;
    }
    const badgeType = typeof n.data?.badgeType === 'string' ? n.data.badgeType : null;
    if (badgeType) {
      if (seenBadgeTypes.has(badgeType)) {
        continue;
      }
      seenBadgeTypes.add(badgeType);
    }
    seenIds.add(n.id);
    seenFingerprints.add(fp);
    out.push(n);
  }

  return out;
};

/**
 * Helper: Serialize notifications to database format (JSON strings)
 */
const serializeNotifications = (notifications: UserNotification[]): string[] => {
  return notifications.map(n => JSON.stringify(n));
};

const ensureNotificationsConfig = () => {
  if (!DATABASE_ID || !USER_PROFILES_TABLE_ID) {
    throw new Error('Database ID or User Profiles Table ID not configured.');
  }
};

const updateStoredNotifications = async (
  userId: string,
  updater: (notifications: UserNotification[]) => UserNotification[]
): Promise<void> => {
  ensureNotificationsConfig();

  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('User profile not found');
  }

  const notificationsRaw = (profile as any).notifications || [];
  const notifications = deserializeNotifications(notificationsRaw);
  const updatedNotifications = updater(notifications);

  await tablesDB.updateRow({
    databaseId: DATABASE_ID,
    tableId: USER_PROFILES_TABLE_ID,
    rowId: profile.$id,
    data: {
      notifications: serializeNotifications(updatedNotifications),
    },
  });
};

export type { NotificationType, UserNotification } from './types';

export interface UserNotificationData {
  userId: string; // User authID
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  /** When true, only add to in-app list; do not send push (e.g. for local event reminders). */
  skipPush?: boolean;
  /** When true, create as read (e.g. user already saw the content in a modal). */
  isRead?: boolean;
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
    const traceId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[notifications][${traceId}] Creating notification:`, notificationData.type, notificationData.title);

    // Get user profile
    const profile = await getUserProfile(notificationData.userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Get existing notifications or initialize empty array
    const existingNotificationsRaw = (profile as any).notifications || [];
    const existingNotifications = deserializeNotifications(existingNotificationsRaw);

    // Idempotency check: reject if an identical notification was created recently.
    // Badge notifications use a much wider window because FCM delivery can be delayed.
    const now = new Date();
    const windowMs = notificationData.type === 'badgeEarned' ? BADGE_DEDUP_WINDOW_MS : DEDUP_WINDOW_MS;
    const isDuplicate = existingNotifications.some((existing) => {
      if (
        existing.type !== notificationData.type ||
        existing.title !== notificationData.title ||
        existing.message !== notificationData.message
      ) {
        return false;
      }
      const createdAt = new Date(existing.createdAt);
      return now.getTime() - createdAt.getTime() < windowMs;
    });

    if (isDuplicate) {
      console.log(
        `[notifications][${traceId}] Skipped duplicate (type=${notificationData.type}, title="${notificationData.title}")`
      );
      // Return a stub so callers don't break
      return {
        id: 'dedup-skipped',
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        isRead: true,
        createdAt: now.toISOString(),
        data: notificationData.data || {},
      };
    }

    // Create new notification
    const newNotification: UserNotification = {
      id: ID.unique(),
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      isRead: notificationData.isRead ?? false,
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

    console.log(`[notifications][${traceId}] Notification created successfully (id=${newNotification.id})`);

    // Send push notification (respects user preferences) unless skipPush
    if (notificationData.skipPush) {
      return newNotification;
    }

    try {
      // Check if user has push notifications enabled
      let pushEnabled = true; // Default to true
      const preferencesRaw = (profile as any).notificationPreferences;
      
      if (preferencesRaw) {
        try {
          const notificationPreferences = typeof preferencesRaw === 'string'
            ? JSON.parse(preferencesRaw)
            : preferencesRaw;
          pushEnabled = notificationPreferences.enablePushNotifications !== false;
        } catch (error) {
          console.warn('[notifications] Error parsing notification preferences, defaulting to enabled');
        }
      }

      if (pushEnabled) {
        console.log(`[notifications][${traceId}] Sending push notification to user:`, notificationData.userId);
        
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
    const notifications = dedupeStoredNotificationsForDisplay(
      deserializeNotifications(notificationsRaw)
    );

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
  try {
    console.log('[notifications] Marking notification as read:', notificationId);
    await markNotificationsAsRead(userId, [notificationId]);

    console.log('[notifications] Notification marked as read');
  } catch (error: any) {
    console.error('[notifications] Error marking notification as read:', error);
    throw new Error(error.message || 'Failed to mark notification as read');
  }
};

/**
 * Mark multiple notifications as read for a user
 */
export const markNotificationsAsRead = async (
  userId: string,
  notificationIds: string[]
): Promise<void> => {
  if (notificationIds.length === 0) {
    return;
  }

  try {
    console.log('[notifications] Marking notifications as read:', notificationIds);

    const notificationIdsToMark = new Set(notificationIds);

    await updateStoredNotifications(userId, (notifications) =>
      notifications.map((notif: UserNotification) =>
        notificationIdsToMark.has(notif.id) ? { ...notif, isRead: true } : notif
      )
    );
  } catch (error: any) {
    console.error('[notifications] Error marking notifications as read:', error);
    throw new Error(error.message || 'Failed to mark notifications as read');
  }
};

/**
 * Mark all unread badgeEarned notifications for a specific badge type as read.
 * Prevents duplicate popups when old orphaned notifications for the same badge
 * type accumulate across multiple grant cycles.
 */
export const markBadgeTypeNotificationsAsRead = async (
  userId: string,
  badgeType: string
): Promise<void> => {
  try {
    await updateStoredNotifications(userId, (notifications) =>
      notifications.map((notif: UserNotification) => {
        if (notif.isRead) return notif;
        // Match on data.badgeType only — covers both current 'badgeEarned' entries
        // and legacy 'Engagement'-type entries created before the backend was fixed.
        if (notif.data?.badgeType !== badgeType) return notif;
        return { ...notif, isRead: true };
      })
    );
  } catch (error: any) {
    console.error('[notifications] Error marking badge-type notifications as read:', error);
    throw new Error(error.message || 'Failed to mark badge notifications as read');
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    console.log('[notifications] Marking all notifications as read for user:', userId);
    await updateStoredNotifications(userId, (notifications) =>
      notifications.map((notif: UserNotification) => ({
        ...notif,
        isRead: true,
      }))
    );

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
