import * as Notifications from 'expo-notifications';
import { NavigationContainerRef } from '@react-navigation/native';
import type { NotificationData } from './types';
import { getCurrentUser } from '@/lib/auth';
import { createUserNotification } from '@/lib/database';

let navigationRef: NavigationContainerRef<any> | null = null;

/**
 * Add an event reminder to the user's in-app notifications list (e.g. "Sampling Today").
 * Used when a local event reminder is received or tapped so it appears in the Notifications screen.
 */
const addEventReminderToNotifications = async (notification: Notifications.Notification) => {
  const data = notification.request.content.data as NotificationData & { type?: string; eventId?: string; reminderType?: string };
  if (data?.type !== 'event_reminder' || !data?.eventId) return;
  try {
    const user = await getCurrentUser();
    if (!user) return;
    const title = notification.request.content.title || 'Sampling Today';
    const body = notification.request.content.body || 'Event reminder';
    await createUserNotification({
      userId: user.$id,
      type: 'eventReminder',
      title,
      message: body,
      data: { eventId: data.eventId, reminderType: data.reminderType },
      skipPush: true,
    });
  } catch (err) {
    console.warn('[notifications] Failed to add event reminder to list:', err);
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
 * Set up notification handlers
 */
export const setupNotificationHandlers = () => {
  console.log('[notifications] Setting up notification handlers...');
  
  // Handle notifications received while app is in foreground
  Notifications.addNotificationReceivedListener((notification) => {
    console.log('[notifications] Notification received (foreground):', notification);
    addEventReminderToNotifications(notification);
  });
  
  // Handle notification taps (add to in-app list when user taps event reminder)
  Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[notifications] Notification response received:', response);
    addEventReminderToNotifications(response.notification);
    handleNotificationTap(response.notification);
  });
  
  console.log('[notifications] Notification handlers set up');
};

/**
 * Get last notification response (for handling notifications when app opens from quit state)
 */
export const getLastNotificationResponse = async (): Promise<Notifications.NotificationResponse | null> => {
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response) {
      console.log('[notifications] Last notification response found:', response);
      addEventReminderToNotifications(response.notification);
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

