/**
 * Event Reminders Module
 * 
 * Handles scheduling and canceling push notifications for event reminders.
 * Schedules reminders 24 hours and 1 hour before events.
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for event reminder notification IDs
const EVENT_REMINDERS_STORAGE_KEY = '@event_reminders';

interface EventReminderIds {
  eventId: string;
  notificationIds: {
    reminder24h?: string;
    reminder1h?: string;
  };
}

interface ScheduledReminders {
  [eventId: string]: {
    reminder24h?: string;
    reminder1h?: string;
  };
}

/**
 * Get all stored reminder notification IDs
 */
const getStoredReminders = async (): Promise<ScheduledReminders> => {
  try {
    const stored = await AsyncStorage.getItem(EVENT_REMINDERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('[eventReminders] Error reading stored reminders:', error);
    return {};
  }
};

/**
 * Save reminder notification IDs to storage
 */
const saveReminders = async (reminders: ScheduledReminders): Promise<void> => {
  try {
    await AsyncStorage.setItem(EVENT_REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error('[eventReminders] Error saving reminders:', error);
  }
};

/**
 * Schedule event reminder notifications
 * @param eventId - Unique identifier for the event
 * @param eventStartDate - Date when the event starts
 * @param eventTitle - Title of the event (for notification message)
 * @param eventLocation - Optional location string for the event
 * @returns Object with scheduled notification IDs, or null if scheduling failed
 */
export const scheduleEventReminders = async (
  eventId: string,
  eventStartDate: Date,
  eventTitle: string,
  eventLocation?: string
): Promise<{ reminder24h?: string; reminder1h?: string } | null> => {
  try {
    // Request notification permissions if not already granted
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        console.warn('[eventReminders] Notification permissions not granted');
        return null;
      }
    }

    const now = new Date();
    const timeUntilEvent = eventStartDate.getTime() - now.getTime();
    const hoursUntilEvent = timeUntilEvent / (1000 * 60 * 60);

    const scheduledIds: { reminder24h?: string; reminder1h?: string } = {};

    // Schedule 24-hour reminder if event is more than 24 hours away
    if (hoursUntilEvent > 24) {
      const reminder24hDate = new Date(eventStartDate.getTime() - 24 * 60 * 60 * 1000);
      
      // Only schedule if the reminder time is in the future
      if (reminder24hDate > now) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Event Reminder',
            body: `${eventTitle} starts in 24 hours${eventLocation ? ` at ${eventLocation}` : ''}`,
            data: {
              type: 'event_reminder',
              eventId: eventId,
              reminderType: '24h',
              screen: 'BrandDetails',
            },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminder24hDate,
          },
        });

        scheduledIds.reminder24h = notificationId;
      }
    }

    // Schedule 1-hour reminder if event is more than 1 hour away
    if (hoursUntilEvent > 1) {
      const reminder1hDate = new Date(eventStartDate.getTime() - 60 * 60 * 1000);
      
      // Only schedule if the reminder time is in the future
      if (reminder1hDate > now) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Event Reminder',
            body: `${eventTitle} starts in 1 hour${eventLocation ? ` at ${eventLocation}` : ''}`,
            data: {
              type: 'event_reminder',
              eventId: eventId,
              reminderType: '1h',
              screen: 'BrandDetails',
            },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminder1hDate,
          },
        });

        scheduledIds.reminder1h = notificationId;
      }
    }

    // If no reminders were scheduled (event too soon or in the past)
    if (Object.keys(scheduledIds).length === 0) {
      return scheduledIds;
    }

    // Store the notification IDs
    const storedReminders = await getStoredReminders();
    storedReminders[eventId] = scheduledIds;
    await saveReminders(storedReminders);

    return scheduledIds;
  } catch (error: any) {
    console.error('[eventReminders] Error scheduling reminders:', error);
    return null;
  }
};

/**
 * Cancel scheduled reminders for an event
 * @param eventId - Unique identifier for the event
 */
export const cancelEventReminders = async (eventId: string): Promise<void> => {
  try {
    const storedReminders = await getStoredReminders();
    const reminders = storedReminders[eventId];

    if (!reminders) {
      return;
    }

    // Cancel both reminders if they exist
    if (reminders.reminder24h) {
      await Notifications.cancelScheduledNotificationAsync(reminders.reminder24h);
    }

    if (reminders.reminder1h) {
      await Notifications.cancelScheduledNotificationAsync(reminders.reminder1h);
    }

    // Remove from storage
    delete storedReminders[eventId];
    await saveReminders(storedReminders);
  } catch (error: any) {
    console.error('[eventReminders] Error canceling reminders:', error);
  }
};

/**
 * Get scheduled reminder IDs for an event
 * @param eventId - Unique identifier for the event
 * @returns Object with reminder notification IDs, or null if not found
 */
export const getEventReminders = async (
  eventId: string
): Promise<{ reminder24h?: string; reminder1h?: string } | null> => {
  try {
    const storedReminders = await getStoredReminders();
    return storedReminders[eventId] || null;
  } catch (error: any) {
    console.error('[eventReminders] Error getting reminders:', error);
    return null;
  }
};

/**
 * Cancel all scheduled event reminders
 * Useful for cleanup or when user logs out
 */
export const cancelAllEventReminders = async (): Promise<void> => {
  try {
    const storedReminders = await getStoredReminders();
    const eventIds = Object.keys(storedReminders);

    // Cancel all notifications
    for (const eventId of eventIds) {
      await cancelEventReminders(eventId);
    }

    // Clear storage
    await AsyncStorage.removeItem(EVENT_REMINDERS_STORAGE_KEY);
  } catch (error: any) {
    console.error('[eventReminders] Error canceling all reminders:', error);
  }
};

/**
 * Clean up reminders for past events
 * This should be called periodically to remove reminders for events that have already passed
 */
export const cleanupPastEventReminders = async (): Promise<void> => {
  try {
    const storedReminders = await getStoredReminders();
    const eventIds = Object.keys(storedReminders);
    let cleanedCount = 0;

    // Get all scheduled notifications to check which ones still exist
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    // Check each stored reminder to see if the notifications still exist
    for (const eventId of eventIds) {
      const reminders = storedReminders[eventId];
      let shouldRemove = false;

      // Check if reminders still exist in the scheduled notifications
      const has24hReminder = reminders.reminder24h 
        ? scheduledNotifications.some((n) => n.identifier === reminders.reminder24h)
        : false;
      const has1hReminder = reminders.reminder1h 
        ? scheduledNotifications.some((n) => n.identifier === reminders.reminder1h)
        : false;

      // Remove if neither reminder exists (they've already fired or been canceled)
      if (!has24hReminder && !has1hReminder) {
        shouldRemove = true;
      }

      if (shouldRemove) {
        delete storedReminders[eventId];
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      await saveReminders(storedReminders);
    }
  } catch (error: any) {
    console.error('[eventReminders] Error cleaning up past reminders:', error);
  }
};
