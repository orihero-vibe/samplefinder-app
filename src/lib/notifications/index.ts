/**
 * Notifications Module
 * 
 * This module handles push notification functionality including:
 * - Permission requests
 * - Token management
 * - Appwrite push target registration
 * - Notification handling
 * - Navigation from notifications
 */

export * from './types';
export {
  requestNotificationPermissions,
  getExpoPushToken,
  registerPushTarget,
  updatePushTarget,
  deletePushTarget,
  initializePushNotifications,
  setupTokenRefreshListener,
  getStoredPushTargetId,
} from '../notifications';
export {
  setNavigationRef,
  setupNotificationHandlers,
  getLastNotificationResponse,
} from './handlers';

