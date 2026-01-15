import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Account, ID } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessaging, getToken, onTokenRefresh, requestPermission, AuthorizationStatus } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import appwriteClient from './appwrite';
import type { PushTargetInfo } from './notifications/types';

const account = new Account(appwriteClient);

// Lazy initialization of Firebase instances
let firebaseApp: ReturnType<typeof getApp> | null = null;
let firebaseMessaging: ReturnType<typeof getMessaging> | null = null;

/**
 * Get or initialize Firebase app instance
 */
const getFirebaseApp = () => {
  if (!firebaseApp) {
    try {
      firebaseApp = getApp();
    } catch (error) {
      console.error('[notifications] Failed to get Firebase app:', error);
      throw new Error('Firebase app not initialized. Make sure Firebase is properly configured.');
    }
  }
  return firebaseApp;
};

/**
 * Get or initialize Firebase messaging instance
 */
const getFirebaseMessaging = () => {
  if (!firebaseMessaging) {
    try {
      firebaseMessaging = getMessaging(getFirebaseApp());
    } catch (error) {
      console.error('[notifications] Failed to get Firebase messaging:', error);
      throw error;
    }
  }
  return firebaseMessaging;
};

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
 * Get FCM token using React Native Firebase
 * This provides a proper FCM token that works with Appwrite Messaging API
 * Works for both Android and iOS (if Firebase is configured with APNs in Firebase Console)
 * @param forceRefresh - If true, always get a fresh token (ignores cached token)
 */
export const getDevicePushToken = async (forceRefresh: boolean = false): Promise<string | null> => {
  try {
    console.log('[notifications] Getting FCM token from Firebase...', { forceRefresh, platform: Platform.OS });
    
    // Check if we already have a token stored (only if not forcing refresh)
    if (!forceRefresh) {
      const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (storedToken) {
        console.log('[notifications] Using stored FCM token');
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
    
    // Request Firebase messaging permission (iOS)
    if (Platform.OS === 'ios') {
      const authStatus = await requestPermission(getFirebaseMessaging());
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.warn('[notifications] Firebase messaging permission not granted on iOS');
        return null;
      }
      
      console.log('[notifications] Firebase messaging permission granted on iOS');
    }
    
    // Get FCM token from React Native Firebase
    const token = await getToken(getFirebaseMessaging());
    
    console.log('[notifications] FCM token obtained:', token);
    console.log('[notifications] Token length:', token.length);
    console.log('[notifications] Platform:', Platform.OS);
    
    // Validate token format
    if (!token || token.length < 20) {
      console.error('[notifications] Invalid FCM token received');
      return null;
    }
    
    // IMPORTANT: iOS Simulator may not work for push notifications
    if (Platform.OS === 'ios') {
      console.log('ℹ️  [notifications] iOS device detected');
      console.log('ℹ️  [notifications] Make sure APNs is configured in Firebase Console for iOS push');
    }
    
    // Store the token
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    
    return token;
  } catch (error: any) {
    console.error('[notifications] Error getting FCM token:', error);
    console.error('[notifications] Make sure Firebase is properly configured in your app');
    return null;
  }
};

/**
 * Get Expo push token (for Expo push service)
 * Note: This is NOT used for Appwrite Messaging - we use native tokens instead
 * @param forceRefresh - If true, always get a fresh token from Expo (ignores cached token)
 */
export const getExpoPushToken = async (forceRefresh: boolean = false): Promise<string | null> => {
  try {
    console.log('[notifications] Getting Expo push token...', { forceRefresh });
    
    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('[notifications] Cannot get token without permissions');
      return null;
    }
    
    // Get the token
    // Note: projectId is required in bare workflow or custom builds
    let projectId: string | undefined;
    
    try {
      projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
      if (projectId) {
        console.log('[notifications] Found projectId in Constants:', projectId);
      }
    } catch (error) {
      console.warn('[notifications] Error getting projectId from Constants:', error);
    }
    
    // Get the token with or without projectId
    let tokenData;
    if (projectId) {
      console.log('[notifications] Getting Expo push token with projectId...');
      tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    } else {
      console.log('[notifications] Getting Expo push token without projectId...');
      tokenData = await Notifications.getExpoPushTokenAsync();
    }
    
    const token = tokenData.data;
    console.log('[notifications] Expo push token obtained:', token);
    
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
    console.log('[notifications] Token to register:', identifier);
    
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
    console.log('[notifications] Provider ID:', providerId || 'not provided');
    
    // Try to delete existing target first (to avoid conflicts)
    try {
      console.log('[notifications] Attempting to delete existing push target...');
      await account.deletePushTarget({ targetId });
      console.log('[notifications] Old push target deleted');
      
      // Small delay to ensure deletion is processed
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (deleteError: any) {
      // Target doesn't exist, which is fine
      if (deleteError?.code === 404 || deleteError?.message?.includes('not found')) {
        console.log('[notifications] No existing target to delete');
      } else {
        console.warn('[notifications] Could not delete existing target:', deleteError?.message);
      }
    }
    
    // Now create new push target with correct provider ID
    try {
      console.log('[notifications] Creating new push target...');
      const result = await account.createPushTarget({
        targetId: targetId,
        identifier: identifier,
        providerId: providerId || '6936f46d003100bd238e', // Use FCM provider ID
      });
      
      console.log('[notifications] Push target created successfully:', result);
      
      // Store the target ID
      await AsyncStorage.setItem(PUSH_TARGET_ID_KEY, targetId);
      
      return {
        targetId: targetId,
        identifier: identifier,
      };
    } catch (createError: any) {
      // If creation fails, log and retry with update
      console.error('[notifications] Failed to create push target:', createError?.message);
      
      // Try to update instead (target might exist despite deletion attempt)
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
        console.error('[notifications] Update also failed:', updateError?.message);
        throw updateError;
      }
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
    // Skip if registration is in progress to avoid race conditions
    if (isRegistering) {
      console.log('[notifications] Registration in progress, skipping update...');
      return true;
    }
    
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
    
    // Get NATIVE device push token (FCM for Android, APNs for iOS)
    // This is required for Appwrite Messaging API
    // Always get a fresh token on initialization to avoid expired token issues
    const token = await getDevicePushToken(true); // Force refresh
    if (!token) {
      console.warn('[notifications] Could not get push token');
      return false;
    }
    
    // Register native token with Appwrite
    // Use the FCM provider ID from Appwrite (6936f46d003100bd238e)
    const fcmProviderId = '6936f46d003100bd238e'; // Your Firebase provider ID from Appwrite
    const result = await registerPushTarget(token, fcmProviderId);
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

// Debounce token refresh to avoid race conditions
let tokenRefreshTimeout: NodeJS.Timeout | null = null;

/**
 * Set up token refresh listener
 * Listens for Firebase FCM token changes and updates Appwrite
 */
export const setupTokenRefreshListener = (): void => {
  console.log('[notifications] Setting up Firebase token refresh listener...');
  
  // Listen for Firebase FCM token refresh
  // This happens when the token changes (app reinstall, token expiration, etc.)
  onTokenRefresh(getFirebaseMessaging(), async (token) => {
    console.log('[notifications] FCM token refreshed:', token);
    console.log('[notifications] Platform:', Platform.OS);
    
    // Update stored token
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    
    // Debounce the update to avoid multiple concurrent registrations
    if (tokenRefreshTimeout) {
      clearTimeout(tokenRefreshTimeout);
    }
    
    tokenRefreshTimeout = setTimeout(async () => {
      // Update Appwrite push target with new FCM token
      await updatePushTarget(token);
      tokenRefreshTimeout = null;
    }, 1000); // Wait 1 second before updating
  });
  
  console.log('[notifications] Firebase token refresh listener set up');
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
 * This clears all cached data and re-registers with a fresh native token
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
    
    // Re-initialize with fresh native device token
    return await initializePushNotifications();
  } catch (error: any) {
    console.error('[notifications] Error refreshing push notifications:', error);
    return false;
  }
};

