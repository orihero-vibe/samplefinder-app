import * as Notifications from 'expo-notifications';
import { NavigationContainerRef } from '@react-navigation/native';
import type { NotificationData } from './types';

let navigationRef: NavigationContainerRef<any> | null = null;

/**
 * Set navigation reference for deep linking
 */
export const setNavigationRef = (ref: NavigationContainerRef<any> | null) => {
  navigationRef = ref;
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
    // The notification will be shown automatically based on our handler configuration
  });
  
  // Handle notification taps
  Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[notifications] Notification response received:', response);
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

