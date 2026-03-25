import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '@/lib/auth';
import { createUserNotification, getUserProfile } from '@/lib/database';
import type { UserNotification } from '@/lib/database';

type SpecialBadgeType = 'ambassador' | 'influencer';

export interface AwardedSpecialBadge {
  type: SpecialBadgeType;
  title: string;
  message: string;
  notificationId: string;
}

const SPECIAL_BADGE_CONTENT: Record<SpecialBadgeType, { title: string; message: string }> = {
  ambassador: {
    title: 'NEW BADGE: CERTIFIED BRAND AMBASSADOR',
    message: 'Congratulations! You earned the Certified Brand Ambassador badge.',
  },
  influencer: {
    title: 'NEW BADGE: CERTIFIED INFLUENCER',
    message: 'Congratulations! You earned the Certified Influencer badge.',
  },
};

type SpecialBadgeState = Record<SpecialBadgeType, boolean>;
const DEFAULT_BADGE_STATE: SpecialBadgeState = { ambassador: false, influencer: false };
const getBadgeStateStorageKey = (authId: string) => `specialBadgeState:${authId}`;
const getShownSpecialBadgesStorageKey = (authId: string) => `shownSpecialBadges:${authId}`;

const toBoolean = (value: unknown): boolean => {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return Boolean(value);
};

const parseNotifications = (notificationsRaw: unknown): UserNotification[] => {
  if (!Array.isArray(notificationsRaw)) {
    return [];
  }

  return notificationsRaw
    .map((entry) => {
      if (typeof entry === 'string') {
        try {
          return JSON.parse(entry) as UserNotification;
        } catch {
          return null;
        }
      }
      return entry as UserNotification;
    })
    .filter((entry): entry is UserNotification => Boolean(entry));
};

const hasSpecialBadgeNotification = (
  notifications: UserNotification[],
  badgeType: SpecialBadgeType
): boolean => {
  return notifications.some((notification) => {
    if (notification.type !== 'badgeEarned') {
      return false;
    }

    const dataBadgeType = notification.data?.badgeType;
    return dataBadgeType === badgeType;
  });
};

const readLastBadgeState = async (authId: string): Promise<SpecialBadgeState> => {
  try {
    const raw = await AsyncStorage.getItem(getBadgeStateStorageKey(authId));
    if (!raw) return DEFAULT_BADGE_STATE;
    const parsed = JSON.parse(raw) as Partial<SpecialBadgeState>;
    return {
      ambassador: Boolean(parsed.ambassador),
      influencer: Boolean(parsed.influencer),
    };
  } catch {
    return DEFAULT_BADGE_STATE;
  }
};

const writeBadgeState = async (authId: string, state: SpecialBadgeState): Promise<void> => {
  try {
    await AsyncStorage.setItem(getBadgeStateStorageKey(authId), JSON.stringify(state));
  } catch {
    // Non-critical: do not block badge flow if local cache fails.
  }
};

const readShownSpecialBadges = async (authId: string): Promise<SpecialBadgeState> => {
  try {
    const raw = await AsyncStorage.getItem(getShownSpecialBadgesStorageKey(authId));
    if (!raw) return DEFAULT_BADGE_STATE;
    const parsed = JSON.parse(raw) as Partial<SpecialBadgeState>;
    return {
      ambassador: Boolean(parsed.ambassador),
      influencer: Boolean(parsed.influencer),
    };
  } catch {
    return DEFAULT_BADGE_STATE;
  }
};

const writeShownSpecialBadges = async (authId: string, state: SpecialBadgeState): Promise<void> => {
  try {
    await AsyncStorage.setItem(getShownSpecialBadgesStorageKey(authId), JSON.stringify(state));
  } catch {
    // Non-critical: do not block badge flow if local cache fails.
  }
};

export const syncSpecialBadgeAwards = async (): Promise<AwardedSpecialBadge[]> => {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const profile = await getUserProfile(user.$id);
  if (!profile) {
    return [];
  }

  const existingNotifications = parseNotifications((profile as any).notifications);
  const lastBadgeState = await readLastBadgeState(user.$id);
  const shownSpecialBadges = await readShownSpecialBadges(user.$id);
  const currentBadgeState: SpecialBadgeState = {
    ambassador: toBoolean(profile.isAmbassador),
    influencer: toBoolean(profile.isInfluencer),
  };
  const newlyAwardedBadges: AwardedSpecialBadge[] = [];

  const maybeAwardBadge = async (badgeType: SpecialBadgeType, isEnabled: boolean) => {
    if (!isEnabled) {
      return;
    }

    if (shownSpecialBadges[badgeType]) {
      return;
    }

    // Primary trigger: badge flag changed from disabled -> enabled.
    const transitionedToEnabled = !lastBadgeState[badgeType] && currentBadgeState[badgeType];
    // Backfill safety: badge is enabled but historical special notification is missing.
    const missingHistoricalNotification = !hasSpecialBadgeNotification(existingNotifications, badgeType);
    if (!transitionedToEnabled && !missingHistoricalNotification) {
      return;
    }

    const content = SPECIAL_BADGE_CONTENT[badgeType];
    const createdNotification = await createUserNotification({
      userId: user.$id,
      type: 'badgeEarned',
      title: content.title,
      message: content.message,
      data: {
        badgeType,
        isSpecialBadge: true,
        screen: 'Profile',
      },
    });

    newlyAwardedBadges.push({
      type: badgeType,
      title: content.title,
      message: content.message,
      notificationId: createdNotification.id,
    });
    shownSpecialBadges[badgeType] = true;
  };

  await maybeAwardBadge('ambassador', currentBadgeState.ambassador);
  await maybeAwardBadge('influencer', currentBadgeState.influencer);
  await writeBadgeState(user.$id, currentBadgeState);
  await writeShownSpecialBadges(user.$id, shownSpecialBadges);

  return newlyAwardedBadges;
};
