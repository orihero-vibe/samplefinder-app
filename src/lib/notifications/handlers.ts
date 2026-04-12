import * as Notifications from 'expo-notifications';
import { NavigationContainerRef } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NotificationData } from './types';
import { useAuthStore } from '@/stores/authStore';
import { createUserNotification } from '@/lib/database';
import type { NotificationType } from '@/lib/database/types';

let navigationRef: NavigationContainerRef<any> | null = null;

// In-memory cache backed by AsyncStorage for cross-session dedup
const persistedNotificationIds = new Set<string>();
const MAX_TRACKED_NOTIFICATIONS = 250;
const trackedNotificationQueue: string[] = [];
const PERSISTED_IDS_STORAGE_KEY = '@persisted_notification_ids';
let persistedIdsLoaded = false;

/**
 * Load persisted notification IDs from AsyncStorage into the in-memory Set.
 * Called once on first notification interaction.
 */
const ensurePersistedIdsLoaded = async (): Promise<void> => {
  if (persistedIdsLoaded) return;
  try {
    const stored = await AsyncStorage.getItem(PERSISTED_IDS_STORAGE_KEY);
    if (stored) {
      const ids: string[] = JSON.parse(stored);
      for (const id of ids) {
        persistedNotificationIds.add(id);
        trackedNotificationQueue.push(id);
      }
    }
    persistedIdsLoaded = true;
  } catch (err) {
    console.warn('[notifications] Failed to load persisted notification IDs:', err);
    persistedIdsLoaded = true;
  }
};

/**
 * Flush the current dedup set to AsyncStorage so it survives app restarts.
 */
const flushPersistedIds = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      PERSISTED_IDS_STORAGE_KEY,
      JSON.stringify(trackedNotificationQueue)
    );
  } catch (err) {
    console.warn('[notifications] Failed to flush persisted notification IDs:', err);
  }
};

const KNOWN_NOTIFICATION_TYPES: NotificationType[] = [
  'checkIn',
  'review',
  'tierChanged',
  'badgeEarned',
  'eventAdded',
  'eventReminder',
  'favoriteBrandUpdate',
];

const normalizeNotificationType = (rawType: unknown): NotificationType => {
  if (typeof rawType !== 'string') {
    return 'eventAdded';
  }

  if (rawType === 'event_reminder') {
    return 'eventReminder';
  }

  if (KNOWN_NOTIFICATION_TYPES.includes(rawType as NotificationType)) {
    return rawType as NotificationType;
  }

  return 'eventAdded';
};

const markNotificationPersisted = (notificationId: string) => {
  if (persistedNotificationIds.has(notificationId)) {
    return;
  }

  persistedNotificationIds.add(notificationId);
  trackedNotificationQueue.push(notificationId);

  if (trackedNotificationQueue.length > MAX_TRACKED_NOTIFICATIONS) {
    const oldestId = trackedNotificationQueue.shift();
    if (oldestId) {
      persistedNotificationIds.delete(oldestId);
    }
  }

  // Persist to AsyncStorage (fire-and-forget)
  flushPersistedIds();
};

/**
 * Add any push notification to the user's in-app notifications list.
 * Deduplicates by notification request identifier to avoid saving the same push twice
 * when both "received" and "response" listeners fire.
 */
const addPushToInAppNotifications = async (
  notification: Notifications.Notification,
  source: 'foreground' | 'response' | 'cold_start'
) => {
  const notificationId = notification.request.identifier;
  const traceId = `${notificationId}-${Date.now()}`;

  // Load persisted IDs from disk if first time
  await ensurePersistedIdsLoaded();

  if (notificationId && persistedNotificationIds.has(notificationId)) {
    console.log(`[notifications][${traceId}] Skipped duplicate (source=${source}, id=${notificationId})`);
    return;
  }

  // Mark immediately to prevent concurrent calls from duplicating
  if (notificationId) {
    markNotificationPersisted(notificationId);
  }

  try {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const data = (notification.request.content.data || {}) as NotificationData & {
      type?: string;
      eventId?: string;
      reminderType?: string;
    };
    const title = notification.request.content.title || 'Sampling Today';
    const body = notification.request.content.body || 'Event reminder';

    const payloadData: Record<string, unknown> = {};
    Object.entries(data || {}).forEach(([key, value]) => {
      payloadData[key] = value;
    });

    console.log(`[notifications][${traceId}] Persisting in-app notification (source=${source}, type=${data?.type}, title="${title}")`);

    await createUserNotification({
      userId: user.$id,
      type: normalizeNotificationType(data?.type),
      title,
      message: body,
      data: payloadData,
      skipPush: true,
    });

    console.log(`[notifications][${traceId}] Successfully persisted`);
  } catch (err) {
    console.warn(`[notifications][${traceId}] Failed to add push notification to in-app list:`, err);
  }
};

/**
 * Set navigation reference for deep linking
 */
export const setNavigationRef = (ref: NavigationContainerRef<any> | null) => {
  navigationRef = ref;
};

/**
 * Get navigation reference for navigation from anywhere in the app
 */
export const getNavigationRef = (): NavigationContainerRef<any> | null => {
  return navigationRef;
};

/**
 * Handle notification tap and navigate to appropriate screen
 */
const handleNotificationTap = (notification: Notifications.Notification) => {
  console.log('[notifications] Notification tapped:', notification);
  
  const data = notification.request.content.data as NotificationData;
  
  if (!navigationRef || !data) {
    console.warn('[notifications] No navigation ref or data available');
    return;
  }
  
  try {
    // Navigate based on notification type
    if (data.screen) {
      const screenName = data.screen;
      const params: any = {};
      
      // Add relevant params based on notification type
      if (data.eventId) {
        params.eventId = data.eventId;
      }
      if (data.clientId) {
        params.clientId = data.clientId;
      }
      
      // Merge any additional params from notification data
      Object.keys(data).forEach((key) => {
        if (key !== 'screen' && key !== 'type') {
          params[key] = data[key];
        }
      });
      
      console.log('[notifications] Navigating to:', screenName, params);
      
      // Navigate to the screen
      // Use type assertion to handle nested navigation
      const nav = navigationRef as any;
      
      if (screenName === 'EventDetails' && params.eventId) {
        // Note: EventDetails is actually BrandDetails in HomeStack
        nav.navigate('MainTabs', {
          screen: 'Home',
          params: {
            screen: 'BrandDetails',
            params: { eventId: params.eventId },
          },
        });
      } else if (screenName === 'BrandDetails' && params.eventId) {
        // Handle event reminder notifications (with eventId)
        nav.navigate('MainTabs', {
          screen: 'Home',
          params: {
            screen: 'BrandDetails',
            params: { eventId: params.eventId },
          },
        });
      } else if (screenName === 'BrandDetails' && params.clientId) {
        nav.navigate('MainTabs', {
          screen: 'Home',
          params: {
            screen: 'BrandDetails',
            params: { eventId: params.clientId },
          },
        });
      } else if (screenName === 'Profile') {
        nav.navigate('MainTabs', {
          screen: 'Profile',
        });
      } else if (screenName === 'Notifications') {
        nav.navigate('MainTabs', {
          screen: 'Profile',
          params: {
            screen: 'Notifications',
          },
        });
      } else {
        // Default navigation
        nav.navigate(screenName, params);
      }
    }
  } catch (error: any) {
    console.error('[notifications] Error navigating from notification:', error);
  }
};

/**
 * Set up notification handlers.
 * Returns a cleanup function that removes the listeners — call it in your
 * useEffect cleanup to prevent listener accumulation on component remount.
 */
export const setupNotificationHandlers = (): (() => void) => {
  console.log('[notifications] Setting up notification handlers...');

  // Handle notifications received while app is in foreground
  const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[notifications] Notification received (foreground):', notification.request.identifier);
    addPushToInAppNotifications(notification, 'foreground');
  });

  // Handle notification taps — dedup already handled inside addPushToInAppNotifications
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[notifications] Notification response received:', response.notification.request.identifier);
    addPushToInAppNotifications(response.notification, 'response');
    handleNotificationTap(response.notification);
  });

  console.log('[notifications] Notification handlers set up');

  return () => {
    console.log('[notifications] Removing notification handlers');
    receivedSub.remove();
    responseSub.remove();
  };
};

/**
 * Get last notification response (for handling notifications when app opens from quit state)
 */
export const getLastNotificationResponse = async (): Promise<Notifications.NotificationResponse | null> => {
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response) {
      console.log('[notifications] Last notification response found:', response.notification.request.identifier);
      addPushToInAppNotifications(response.notification, 'cold_start');
      // Handle the notification after a short delay to ensure navigation is ready
      setTimeout(() => {
        handleNotificationTap(response.notification);
      }, 1000);
    }
    return response;
  } catch (error: any) {
    console.error('[notifications] Error getting last notification response:', error);
    return null;
  }
};

