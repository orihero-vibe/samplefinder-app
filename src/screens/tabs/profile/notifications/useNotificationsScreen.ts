import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NotificationSetting } from './components';
import { getCurrentUser } from '@/lib/auth';
import { getUserProfile, getNotificationPreferences, updateNotificationPreferences } from '@/lib/database/users';

export const useNotificationsScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  // Location settings
  const [enableLocationAccess, setEnableLocationAccess] = useState(true);
  const [shareLocationWithBrands, setShareLocationWithBrands] = useState(false);

  // Notification settings
  const [enablePushNotifications, setEnablePushNotifications] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'eventReminders',
      label: 'Event Reminders',
      description: 'Get notified before events you favorited start.',
      enabled: true,
    },
    {
      id: 'checkInConfirmations',
      label: 'Check-in Confirmations',
      description: 'Confirmation when you successfully check in.',
      enabled: true,
    },
    {
      id: 'triviaGames',
      label: 'Trivia & Games',
      description: 'Daily trivia and game opportunities.',
      enabled: true,
    },
    {
      id: 'rewardsUpdates',
      label: 'Rewards Updates',
      description: 'Tier progression and reward milestones.',
      enabled: true,
    },
    {
      id: 'newEventsNearby',
      label: 'New Events Nearby',
      description: 'When new events are added near you.',
      enabled: true,
    },
    {
      id: 'favoriteBrandUpdates',
      label: 'Favorite Brand Updates',
      description: 'News from your favorite brands.',
      enabled: false,
    },
  ]);

  // Load preferences from database on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        console.warn('[notifications] No user logged in, using default preferences');
        setIsLoading(false);
        return;
      }

      const preferences = await getNotificationPreferences(user.$id);
      if (preferences) {
        setEnablePushNotifications(preferences.enablePushNotifications);
        setNotificationSettings((prev) =>
          prev.map((setting) => ({
            ...setting,
            enabled: preferences[setting.id as keyof typeof preferences] ?? setting.enabled,
          }))
        );
      }
    } catch (error: any) {
      console.error('[notifications] Error loading preferences:', error);
      // Continue with default preferences on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNotificationToggle = async (id: string) => {
    const updatedSettings = notificationSettings.map((setting) =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    );
    setNotificationSettings(updatedSettings);

    // Save to database
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.warn('[notifications] No user logged in, cannot save preferences');
        return;
      }

      const setting = updatedSettings.find((s) => s.id === id);
      if (setting) {
        await updateNotificationPreferences(user.$id, {
          [id]: setting.enabled,
        });
        console.log('[notifications] Preference updated:', id, setting.enabled);
      }
    } catch (error: any) {
      console.error('[notifications] Error saving preference:', error);
      // Revert on error
      setNotificationSettings(notificationSettings);
    }
  };

  const handlePushNotificationsChange = async (value: boolean) => {
    setEnablePushNotifications(value);

    // Save to database
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.warn('[notifications] No user logged in, cannot save preferences');
        return;
      }

      await updateNotificationPreferences(user.$id, {
        enablePushNotifications: value,
      });
      console.log('[notifications] Push notifications preference updated:', value);
    } catch (error: any) {
      console.error('[notifications] Error saving push notifications preference:', error);
      // Revert on error
      setEnablePushNotifications(!value);
    }
  };

  return {
    enableLocationAccess,
    shareLocationWithBrands,
    enablePushNotifications,
    notificationSettings,
    isLoading,
    setEnableLocationAccess,
    setShareLocationWithBrands,
    handleBackPress,
    handleNotificationToggle,
    handlePushNotificationsChange,
  };
};

