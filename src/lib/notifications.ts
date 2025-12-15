import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Account, ID } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appwriteClient from './appwrite';
import type { PushTargetInfo } from './notifications/types';

const account = new Account(appwriteClient);

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Storage keys
const PUSH_TARGET_ID_KEY = '@push_target_id';
const PUSH_TOKEN_KEY = '@push_token';

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    console.log('[notifications] Requesting notification permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('[notifications] Notification permissions not granted');
      return false;
    }
    
    console.log('[notifications] Notification permissions granted');
    return true;
  } catch (error: any) {
    console.error('[notifications] Error requesting permissions:', error);
    return false;
  }
};

/**
 * Get Expo push token
 */
export const getExpoPushToken = async (): Promise<string | null> => {
  try {
    console.log('[notifications] Getting Expo push token...');
    
    // Check if we already have a token stored
    const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (storedToken) {
      console.log('[notifications] Using stored push token');
      return storedToken;
    }
    
    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('[notifications] Cannot get token without permissions');
      return null;
    }
    
    // Get the token
    // Note: projectId is optional in development but required in production
    // For Expo managed workflow, it's automatically detected
    // For bare workflow or custom builds, you may need to specify it
    let tokenData;
    try {
      tokenData = await Notifications.getExpoPushTokenAsync();
    } catch (error: any) {
      // If it fails, try with projectId from app.json slug or EAS project
      console.warn('[notifications] Failed to get token without projectId, trying with projectId...');
      // You can add your Expo project ID here if needed
      // tokenData = await Notifications.getExpoPushTokenAsync({ projectId: 'your-expo-project-id' });
      throw error;
    }
    
    const token = tokenData.data;
    console.log('[notifications] Expo push token obtained:', token);
    
    // Store the token
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    
    return token;
  } catch (error: any) {
    console.error('[notifications] Error getting Expo push token:', error);
    return null;
  }
};

/**
 * Register push target with Appwrite
 */
export const registerPushTarget = async (identifier: string, providerId?: string): Promise<PushTargetInfo | null> => {
  try {
    console.log('[notifications] Registering push target with Appwrite...');
    
    // Check if user is logged in
    try {
      await account.get();
    } catch (error) {
      console.warn('[notifications] User not logged in, cannot register push target');
      return null;
    }
    
    // Check if we already have a push target
    const existingTargetId = await AsyncStorage.getItem(PUSH_TARGET_ID_KEY);
    
    if (existingTargetId) {
      // Update existing target
      console.log('[notifications] Updating existing push target:', existingTargetId);
      try {
        await account.updatePushTarget({
          targetId: existingTargetId,
          identifier: identifier,
        });
        console.log('[notifications] Push target updated successfully');
        return {
          targetId: existingTargetId,
          identifier: identifier,
        };
      } catch (error: any) {
        console.warn('[notifications] Failed to update push target, creating new one:', error);
        // If update fails, try creating a new one
      }
    }
    
    // Create new push target
    const targetId = ID.unique();
    console.log('[notifications] Creating new push target:', targetId);
    
    const result = await account.createPushTarget({
      targetId: targetId,
      identifier: identifier,
      providerId: providerId, // Optional: specify FCM provider ID if you have it
    });
    
    console.log('[notifications] Push target created successfully:', result);
    
    // Store the target ID
    await AsyncStorage.setItem(PUSH_TARGET_ID_KEY, targetId);
    
    return {
      targetId: targetId,
      identifier: identifier,
    };
  } catch (error: any) {
    console.error('[notifications] Error registering push target:', error);
    console.error('[notifications] Error details:', error?.message, error?.code);
    return null;
  }
};

/**
 * Update push target when token changes
 */
export const updatePushTarget = async (identifier: string): Promise<boolean> => {
  try {
    console.log('[notifications] Updating push target...');
    
    const targetId = await AsyncStorage.getItem(PUSH_TARGET_ID_KEY);
    if (!targetId) {
      console.warn('[notifications] No push target ID found, registering new target');
      const result = await registerPushTarget(identifier);
      return result !== null;
    }
    
    await account.updatePushTarget({
      targetId: targetId,
      identifier: identifier,
    });
    
    console.log('[notifications] Push target updated successfully');
    return true;
  } catch (error: any) {
    console.error('[notifications] Error updating push target:', error);
    return false;
  }
};

/**
 * Delete push target (on logout)
 */
export const deletePushTarget = async (): Promise<void> => {
  try {
    console.log('[notifications] Deleting push target...');
    
    const targetId = await AsyncStorage.getItem(PUSH_TARGET_ID_KEY);
    if (!targetId) {
      console.log('[notifications] No push target ID found');
      return;
    }
    
    try {
      await account.deletePushTarget({
        targetId: targetId,
      });
      console.log('[notifications] Push target deleted successfully');
    } catch (error: any) {
      console.warn('[notifications] Error deleting push target (may already be deleted):', error);
    }
    
    // Clear stored data
    await AsyncStorage.removeItem(PUSH_TARGET_ID_KEY);
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
  } catch (error: any) {
    console.error('[notifications] Error in deletePushTarget:', error);
  }
};

/**
 * Initialize push notifications
 * Call this after user logs in
 */
export const initializePushNotifications = async (): Promise<boolean> => {
  try {
    console.log('[notifications] Initializing push notifications...');
    
    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('[notifications] Permissions not granted, cannot initialize');
      return false;
    }
    
    // Get push token
    const token = await getExpoPushToken();
    if (!token) {
      console.warn('[notifications] Could not get push token');
      return false;
    }
    
    // Register with Appwrite
    const result = await registerPushTarget(token);
    if (!result) {
      console.warn('[notifications] Could not register push target');
      return false;
    }
    
    console.log('[notifications] Push notifications initialized successfully');
    return true;
  } catch (error: any) {
    console.error('[notifications] Error initializing push notifications:', error);
    return false;
  }
};

/**
 * Set up token refresh listener
 */
export const setupTokenRefreshListener = (): void => {
  console.log('[notifications] Setting up token refresh listener...');
  
  // Listen for token changes
  Notifications.addPushTokenListener(async (tokenData) => {
    console.log('[notifications] Push token refreshed:', tokenData.data);
    const token = tokenData.data;
    
    // Update stored token
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    
    // Update Appwrite push target
    await updatePushTarget(token);
  });
  
  console.log('[notifications] Token refresh listener set up');
};

/**
 * Get stored push target ID
 */
export const getStoredPushTargetId = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(PUSH_TARGET_ID_KEY);
};

