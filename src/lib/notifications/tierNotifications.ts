import * as Notifications from 'expo-notifications';

const ensurePermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};

/**
 * Send an immediate local push notification when a user achieves a new tier.
 * Uses expo-notifications to fire instantly (trigger: null).
 */
export const sendNewTierPushNotification = async (tierName: string): Promise<void> => {
  try {
    if (!(await ensurePermissions())) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `NEW TIER: ${tierName}!`,
        body: `Congratulations, you've reached the ${tierName} tier! Keep earning points to level up!`,
        data: {
          type: 'tierChanged',
          tierName,
          screen: 'Promotions',
        },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('[tierNotifications] Failed to send new tier push notification:', error);
  }
};

/**
 * Send an immediate local push notification when a user earns a new badge.
 * @param badgeType - 'checkIn' or 'review'
 * @param threshold - The badge level number (e.g. 5, 10, 25)
 */
export const sendNewBadgePushNotification = async (
  badgeType: 'checkIn' | 'review',
  threshold: number,
): Promise<void> => {
  try {
    if (!(await ensurePermissions())) return;

    const isCheckIn = badgeType === 'checkIn';
    const title = isCheckIn
      ? `NEW BADGE: SAMPLEFINDER CHECK-IN LEVEL ${threshold}`
      : `NEW BADGE: SAMPLEFINDER REVIEW LEVEL ${threshold}`;
    const body = isCheckIn
      ? `Congratulations, you earned the ${threshold} check-in level badge! Keep sampling to earn more points!`
      : `Congratulations, you earned the ${threshold} review level badge! Keep reviewing to earn more points!`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'badgeEarned',
          badgeType,
          threshold,
          screen: 'Promotions',
        },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('[tierNotifications] Failed to send new badge push notification:', error);
  }
};
