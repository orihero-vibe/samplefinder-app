import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores/authStore';
import {
  createUserNotification,
  getUserProfile,
  updateUserProfile,
  getUnreadNotifications,
} from '@/lib/database';
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
const SPECIAL_BADGE_POINTS = 100;
const getBadgeStateStorageKey = (authId: string) => `specialBadgeState:${authId}`;

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

const parseBadgeState = (rawState: Partial<SpecialBadgeState> | null | undefined): SpecialBadgeState => {
  return {
    ambassador: toBoolean(rawState?.ambassador),
    influencer: toBoolean(rawState?.influencer),
  };
};

const parseNotifications = (notificationsRaw: unknown): UserNotification[] => {
  let list: unknown[] = [];

  if (Array.isArray(notificationsRaw)) {
    list = notificationsRaw;
  } else if (typeof notificationsRaw === 'string') {
    try {
      const parsed = JSON.parse(notificationsRaw) as unknown;
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      list = [];
    }
  }

  return list
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
    return parseBadgeState(parsed);
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

const parseSpecialBadgeType = (raw: unknown): SpecialBadgeType | null => {
  if (raw === 'ambassador' || raw === 'influencer') {
    return raw;
  }
  return null;
};

/**
 * Each unread ambassador / influencer badge notification should show the earned modal once
 * (same pattern as tier awards). Supports repeated admin grants while the profile flag stays on.
 */
const awardsFromUnreadSpecialBadgeNotifications = (
  unreadNotifications: UserNotification[]
): AwardedSpecialBadge[] => {
  const out: AwardedSpecialBadge[] = [];
  const seenBadgeTypes = new Set<string>();
  for (const notification of unreadNotifications) {
    if (notification.type !== 'badgeEarned' || notification.isRead) {
      continue;
    }
    const badgeType = parseSpecialBadgeType(notification.data?.badgeType);
    if (!badgeType) {
      continue;
    }
    // Only surface the first (newest) notification per badge type. Old orphaned
    // unread entries from prior grant cycles share the same type and are cleared
    // when the active award is dismissed via markBadgeTypeNotificationsAsRead.
    if (seenBadgeTypes.has(badgeType)) {
      continue;
    }
    seenBadgeTypes.add(badgeType);
    out.push({
      type: badgeType,
      title: notification.title,
      message: notification.message,
      notificationId: notification.id,
    });
  }
  return out;
};

/**
 * Sync identifier-badge (ambassador / influencer) awards.
 *
 * - Surfaces every **unread** `badgeEarned` notification for those types so the modal can repeat
 *   whenever admin (or the client) issues a new notification.
 * - Still creates points + a notification on the client when the profile flag transitions
 *   disabled → enabled, or when the badge is enabled but no historical notification exists yet.
 */
export const syncSpecialBadgeAwards = async (): Promise<AwardedSpecialBadge[]> => {
  const user = useAuthStore.getState().user;
  if (!user) {
    return [];
  }

  const [profile, unreadNotifications] = await Promise.all([
    getUserProfile(user.$id),
    getUnreadNotifications(user.$id, 50),
  ]);
  if (!profile) {
    return [];
  }

  const existingNotifications = parseNotifications((profile as any).notifications);
  const lastBadgeState = await readLastBadgeState(user.$id);
  const currentBadgeState: SpecialBadgeState = {
    ambassador: toBoolean(profile.isAmbassador),
    influencer: toBoolean(profile.isInfluencer),
  };

  const unreadAwards = awardsFromUnreadSpecialBadgeNotifications(unreadNotifications);

  let updatedTotalPoints = Number(profile.totalPoints || 0);
  const clientCreatedAwards: AwardedSpecialBadge[] = [];

  const maybeAwardBadge = async (badgeType: SpecialBadgeType, isEnabled: boolean) => {
    if (!isEnabled) {
      return;
    }

    // Primary trigger: badge flag changed from disabled -> enabled.
    const transitionedToEnabled = !lastBadgeState[badgeType] && currentBadgeState[badgeType];
    // Backfill: badge is enabled but no historical special notification exists yet.
    const missingHistoricalNotification = !hasSpecialBadgeNotification(existingNotifications, badgeType);
    if (!transitionedToEnabled && !missingHistoricalNotification) {
      return;
    }

    // Award points on transition only (not backfill) to avoid double-awarding.
    // The backfill path is triggered when the flag was already enabled on a prior run
    // but the notification was never stored, so points were already awarded then.
    if (transitionedToEnabled) {
      updatedTotalPoints += SPECIAL_BADGE_POINTS;
      await updateUserProfile(profile.$id, {
        totalPoints: updatedTotalPoints,
      });
    }

    // If the admin portal already issued a matching `badgeEarned` notification, use it
    // to drive the modal instead of creating a client-side duplicate.
    if (unreadAwards.some((a) => a.type === badgeType)) {
      return;
    }

    // On a fresh transition the admin panel sets the profile flag BEFORE the Appwrite
    // function creates the server notification. Skip creating a client notification here
    // so the server notification (arriving within seconds) is the single source of truth.
    // If the server notification never arrives, the next sync cycle will hit
    // missingHistoricalNotification=true and fall through to the backfill path below.
    if (transitionedToEnabled) {
      return;
    }

    // Backfill only: badge is enabled but no notification was ever recorded.
    const content = SPECIAL_BADGE_CONTENT[badgeType];
    const createdNotification = await createUserNotification({
      userId: user.$id,
      type: 'badgeEarned',
      title: content.title,
      message: content.message,
      data: {
        badgeType,
        isSpecialBadge: true,
        pointsEarned: SPECIAL_BADGE_POINTS,
        screen: 'Profile',
      },
      skipPush: true,
    });

    clientCreatedAwards.push({
      type: badgeType,
      title: content.title,
      message: content.message,
      notificationId: createdNotification.id,
    });
  };

  await maybeAwardBadge('ambassador', currentBadgeState.ambassador);
  await maybeAwardBadge('influencer', currentBadgeState.influencer);
  await writeBadgeState(user.$id, currentBadgeState);

  const seenIds = new Set<string>();
  const merged: AwardedSpecialBadge[] = [];
  for (const award of [...unreadAwards, ...clientCreatedAwards]) {
    if (seenIds.has(award.notificationId)) {
      continue;
    }
    seenIds.add(award.notificationId);
    merged.push(award);
  }

  return merged;
};
