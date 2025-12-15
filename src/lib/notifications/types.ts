/**
 * Notification Types
 */

export interface NotificationPreferences {
  enablePushNotifications: boolean;
  eventReminders: boolean;
  checkInConfirmations: boolean;
  triviaGames: boolean;
  rewardsUpdates: boolean;
  newEventsNearby: boolean;
  favoriteBrandUpdates: boolean;
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

