import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NotificationSetting } from './components';

export const useNotificationsScreen = () => {
  const navigation = useNavigation();

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

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNotificationToggle = (id: string) => {
    setNotificationSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  return {
    enableLocationAccess,
    shareLocationWithBrands,
    enablePushNotifications,
    notificationSettings,
    setEnableLocationAccess,
    setShareLocationWithBrands,
    setEnablePushNotifications,
    handleBackPress,
    handleNotificationToggle,
  };
};

