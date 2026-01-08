import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
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

// Mutex to prevent concurrent push target registration
let isRegistering = false;

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
 * @param forceRefresh - If true, always get a fresh token from Expo (ignores cached token)
 */
export const getExpoPushToken = async (forceRefresh: boolean = false): Promise<string | null> => {
  try {
    console.log('[notifications] Getting Expo push token...', { forceRefresh });
    
    // Check if we already have a token stored (only if not forcing refresh)
    if (!forceRefresh) {
      const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (storedToken) {
        console.log('[notifications] Using stored push token');
        return storedToken;
      }
    } else {
      console.log('[notifications] Force refresh requested, clearing cached token');
      await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
    }
    
    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('[notifications] Cannot get token without permissions');
      return null;
    }
    
    // Get the token
    // Note: projectId is required in bare workflow or custom builds
    // Try to get it from Constants first
    let projectId: string | undefined;
    
    try {
      // Try to get projectId from Constants.expoConfig.extra.eas.projectId
      // This should be set in app.json under "extra.eas.projectId"
      projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
      
      if (projectId) {
        console.log('[notifications] Found projectId in Constants:', projectId);
      } else {
        console.warn('[notifications] Project ID not found in Constants.expoConfig.extra.eas.projectId');
        console.warn('[notifications] To fix this, add your EAS project ID to app.json:');
        console.warn('[notifications]   "extra": { "eas": { "projectId": "your-project-id" } }');
        console.warn('[notifications] You can find your project ID by running: npx eas project:info');
      }
    } catch (error) {
      console.warn('[notifications] Error getting projectId from Constants:', error);
    }
    
    // Get the token with or without projectId
    let tokenData;
    try {
      if (projectId) {
        console.log('[notifications] Getting Expo push token with projectId...');
        tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      } else {
        // Try without projectId first (works in managed workflow, may fail in bare workflow)
        console.log('[notifications] Getting Expo push token without projectId (may fail in bare workflow)...');
        tokenData = await Notifications.getExpoPushTokenAsync();
      }
    } catch (error: any) {
      // If it fails because projectId is missing, provide helpful error message
      if (error?.message?.includes('projectId') || error?.message?.includes('No "projectId"')) {
        console.error('[notifications] Error: projectId is required for Expo push tokens in bare workflow.');
        console.error('[notifications] Please add your EAS project ID to app.json:');
        console.error('[notifications]   "extra": { "eas": { "projectId": "your-project-id" } }');
        console.error('[notifications] Find your project ID: npx eas project:info');
        throw new Error('Expo push token requires projectId. Add it to app.json under extra.eas.projectId');
      }
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
 * Generate a deterministic target ID based on user ID and platform
 * This ensures the same user on the same platform always uses the same target ID
 */
const generateTargetId = (userId: string): string => {
  const platform = Platform.OS; // 'ios' or 'android'
  // Create a deterministic ID: first 20 chars of a hash-like string
  // Format: push_{platform}_{userId} truncated to valid Appwrite ID length
  const baseId = `push_${platform}_${userId}`;
  // Appwrite IDs must be alphanumeric with periods, hyphens, underscores (max 36 chars)
  return baseId.substring(0, 36).replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * Register push target with Appwrite
 */
export const registerPushTarget = async (identifier: string, providerId?: string): Promise<PushTargetInfo | null> => {
  // Prevent concurrent registration attempts
  if (isRegistering) {
    console.log('[notifications] Registration already in progress, skipping...');
    return null;
  }
  
  isRegistering = true;
  
  try {
    console.log('[notifications] Registering push target with Appwrite...');
    
    // Check if user is logged in
    let currentUser;
    try {
      currentUser = await account.get();
    } catch (error) {
      console.warn('[notifications] User not logged in, cannot register push target');
      return null;
    }
    
    // Use deterministic target ID based on user ID
    const targetId = generateTargetId(currentUser.$id);
    console.log('[notifications] Using deterministic target ID:', targetId);
    
    // First, try to update the existing target (most common case)
    try {
      console.log('[notifications] Attempting to update existing push target...');
      await account.updatePushTarget({
        targetId: targetId,
        identifier: identifier,
      });
      console.log('[notifications] Push target updated successfully');
      
      // Store the target ID
      await AsyncStorage.setItem(PUSH_TARGET_ID_KEY, targetId);
      
      return {
        targetId: targetId,
        identifier: identifier,
      };
    } catch (updateError: any) {
      // If update fails (target doesn't exist yet), try to create it
      if (updateError?.code === 404 || updateError?.message?.includes('not found')) {
        console.log('[notifications] Target not found, creating new one...');
      } else {
        console.warn('[notifications] Update failed:', updateError?.message);
      }
    }
    
    // Try to create new push target
    try {
      console.log('[notifications] Creating new push target:', targetId);
      const result = await account.createPushTarget({
        targetId: targetId,
        identifier: identifier,
        providerId: providerId,
      });
      
      console.log('[notifications] Push target created successfully:', result);
      
      // Store the target ID
      await AsyncStorage.setItem(PUSH_TARGET_ID_KEY, targetId);
      
      return {
        targetId: targetId,
        identifier: identifier,
      };
    } catch (createError: any) {
      // If target already exists (409), delete it and recreate
      if (createError?.code === 409 || createError?.message?.includes('already exists')) {
        console.warn('[notifications] Push target already exists with different owner, deleting and recreating...');
        
        try {
          // Delete the existing target
          await account.deletePushTarget({ targetId: targetId });
          console.log('[notifications] Deleted existing push target');
          
          // Small delay to ensure deletion is processed
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Create new push target
          const result = await account.createPushTarget({
            targetId: targetId,
            identifier: identifier,
            providerId: providerId,
          });
          
          console.log('[notifications] Push target recreated successfully:', result);
          
          // Store the target ID
          await AsyncStorage.setItem(PUSH_TARGET_ID_KEY, targetId);
          
          return {
            targetId: targetId,
            identifier: identifier,
          };
        } catch (retryError: any) {
          console.error('[notifications] Failed to recreate push target:', retryError?.message);
          // As last resort, try with a unique ID
          const fallbackId = ID.unique();
          console.log('[notifications] Trying with fallback unique ID:', fallbackId);
          
          const result = await account.createPushTarget({
            targetId: fallbackId,
            identifier: identifier,
            providerId: providerId,
          });
          
          console.log('[notifications] Push target created with fallback ID:', result);
          await AsyncStorage.setItem(PUSH_TARGET_ID_KEY, fallbackId);
          
          return {
            targetId: fallbackId,
            identifier: identifier,
          };
        }
      }
      throw createError;
    }
  } catch (error: any) {
    console.error('[notifications] Error registering push target:', error);
    console.error('[notifications] Error details:', error?.message, error?.code);
    return null;
  } finally {
    isRegistering = false;
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
 * Always gets a fresh token to avoid expired token issues
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
    
    // Always get a fresh push token on initialization to avoid expired token issues
    // This ensures we're always registering with the latest valid token
    const token = await getExpoPushToken(true); // Force refresh
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

/**
 * Clear all cached push notification data
 * Call this when you need to force a complete refresh of push tokens
 */
export const clearPushNotificationCache = async (): Promise<void> => {
  console.log('[notifications] Clearing push notification cache...');
  await AsyncStorage.removeItem(PUSH_TARGET_ID_KEY);
  await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
  console.log('[notifications] Push notification cache cleared');
};

/**
 * Refresh push notifications completely
 * This clears all cached data and re-registers with a fresh token
 * Use this when expired token errors are encountered
 */
export const refreshPushNotifications = async (): Promise<boolean> => {
  try {
    console.log('[notifications] Refreshing push notifications...');
    
    // Clear all cached data
    await clearPushNotificationCache();
    
    // Delete existing push target from Appwrite (if any)
    try {
      const targetId = await AsyncStorage.getItem(PUSH_TARGET_ID_KEY);
      if (targetId) {
        await account.deletePushTarget({ targetId });
      }
    } catch (error) {
      // Ignore errors when deleting - target might already be gone
      console.log('[notifications] Could not delete old push target (may already be gone)');
    }
    
    // Clear cache again to ensure clean state
    await clearPushNotificationCache();
    
    // Re-initialize with fresh token
    return await initializePushNotifications();
  } catch (error: any) {
    console.error('[notifications] Error refreshing push notifications:', error);
    return false;
  }
};

