/**
 * Push Notifications Module
 * Handles sending push notifications via Appwrite Cloud Function
 */

import { Functions, ExecutionMethod } from 'react-native-appwrite';
import client from './appwrite';
import type { NotificationType } from './database/types';

const APPWRITE_FUNCTION_ID = process.env.EXPO_PUBLIC_APPWRITE_NOTIFICATION_FUNCTION_ID || 'send-push-notification';

interface PushNotificationData {
  userId: string; // Appwrite auth user ID
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, string>;
}

/**
 * Send a push notification to a specific user
 * Calls Appwrite Cloud Function to send push via Messaging API
 */
export const sendPushNotification = async (
  notificationData: PushNotificationData
): Promise<boolean> => {
  try {
    console.log('[pushNotifications] Attempting to send push notification:', {
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
    });

    // Initialize Functions service
    const functions = new Functions(client);

    // Prepare custom data payload
    const customData: Record<string, string> = {
      type: notificationData.type,
      ...(notificationData.data || {}),
    };

    // Call cloud function to send push notification
    // The function has server-side API key to use Messaging API
    const payload = {
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      data: customData,
    };

    const result = await functions.createExecution(
      APPWRITE_FUNCTION_ID,
      JSON.stringify(payload),
      false, // async = false (wait for result)
      '/send-user-push', // path
      ExecutionMethod.POST, // method
      {
        'Content-Type': 'application/json',
      }
    );

    // Parse response
    let responseData: any = {};
    try {
      responseData = JSON.parse(result.responseBody);
    } catch {
      console.warn('[pushNotifications] Could not parse function response');
    }

    if (result.responseStatusCode === 200 && responseData.success) {
      console.log('[pushNotifications] Push notification sent successfully');
      return true;
    } else {
      console.error('[pushNotifications] Function returned error:', {
        statusCode: result.responseStatusCode,
        error: responseData.error || 'Unknown error',
      });
      return false;
    }
  } catch (error: any) {
    console.error('[pushNotifications] Failed to send push notification:', {
      error: error.message || error,
      userId: notificationData.userId,
      type: notificationData.type,
    });

    // Don't throw - we don't want to fail the main operation if push fails
    // The in-app notification will still be created
    return false;
  }
};

/**
 * Send push notifications to multiple users
 * Useful for batch notifications or broadcasts
 */
export const sendPushNotificationToMultipleUsers = async (
  userIds: string[],
  title: string,
  message: string,
  type: NotificationType,
  data?: Record<string, string>
): Promise<boolean> => {
  try {
    console.log('[pushNotifications] Sending push to multiple users:', {
      userCount: userIds.length,
      type,
      title,
    });

    const functions = new Functions(client);

    const customData: Record<string, string> = {
      type,
      ...(data || {}),
    };

    // Call cloud function to send batch push notification
    const payload = {
      userIds,
      title,
      message,
      data: customData,
    };

    const result = await functions.createExecution(
      APPWRITE_FUNCTION_ID,
      JSON.stringify(payload),
      false,
      '/send-batch-push',
      ExecutionMethod.POST,
      {
        'Content-Type': 'application/json',
      }
    );

    let responseData: any = {};
    try {
      responseData = JSON.parse(result.responseBody);
    } catch {
      console.warn('[pushNotifications] Could not parse function response');
    }

    if (result.responseStatusCode === 200 && responseData.success) {
      console.log('[pushNotifications] Batch push notification sent successfully');
      return true;
    } else {
      console.error('[pushNotifications] Function returned error:', {
        statusCode: result.responseStatusCode,
        error: responseData.error || 'Unknown error',
      });
      return false;
    }
  } catch (error: any) {
    console.error('[pushNotifications] Failed to send batch push:', {
      error: error.message || error,
      userCount: userIds.length,
    });
    return false;
  }
};

/**
 * Check if push notifications are properly configured
 * Pings the cloud function to verify it's accessible
 */
export const checkPushNotificationSetup = async (): Promise<boolean> => {
  try {
    const functions = new Functions(client);
    
    // Ping the function to check if it's accessible
    const result = await functions.createExecution(
      APPWRITE_FUNCTION_ID,
      '',
      false,
      '/ping',
      ExecutionMethod.GET
    );

    if (result.responseStatusCode === 200) {
      console.log('[pushNotifications] Push notification service is configured');
      return true;
    } else {
      console.warn('[pushNotifications] Function responded with error:', result.responseStatusCode);
      return false;
    }
  } catch (error: any) {
    console.warn('[pushNotifications] Push notification service not properly configured:', {
      error: error.message || error,
      hint: 'Make sure the notification cloud function is deployed and accessible',
    });
    return false;
  }
};
