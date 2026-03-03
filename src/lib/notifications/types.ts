/**
 * Notification Types
 */

export interface NotificationPreferences {
  enablePushNotifications: boolean;
}

export interface NotificationData {
  type?: string;
  screen?: string;
  eventId?: string;
  clientId?: string;
  [key: string]: any;
}

export interface PushTargetInfo {
  targetId: string;
  identifier: string;
}

