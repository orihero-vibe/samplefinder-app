import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores/authStore';
import {
  createUserNotification,
  getUserProfile,
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
/**
 * Display value only — the points figure shown in the badge modal. The award itself is made by the
 * Notification function's /send-badge-notification handler, NOT here. See the note on
 * `syncSpecialBadgeAwards` for why the client must not grant points.
 */
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
 * - Creates a notification on the client when the profile flag transitions disabled → enabled, or
 *   when the badge is enabled but no historical notification exists yet, so the modal appears
 *   without waiting on push delivery.
 *
 * This function does NOT grant points, and must not start doing so again.
 *
 * It used to add SPECIAL_BADGE_POINTS whenever it saw a disabled → enabled transition, where
 * "disabled" came from `readLastBadgeState` — an AsyncStorage cache on the device that returns
 * DEFAULT_BADGE_STATE (both badges false) on any miss. For a user whose badge was already enabled
 * server-side, a reinstall, a cleared app storage, or simply a new device made the cache miss look
 * like a fresh grant, so the client added another 100 points. With no idempotency key it could
 * repeat indefinitely: points climbing with no user activity, which is what the client reported as
 * "several users' points jumped 100 at the same time".
 *
 * Neither available store could fix that from here. AsyncStorage is per-device and lost on
 * reinstall; `user_profiles.notifications` is server-side but capped at MAX_NOTIFICATIONS (50) in
 * createUserNotification, so an old badge notification is eventually evicted and the "already
 * awarded" evidence disappears. A client simply cannot tell "granted just now" from "granted a year
 * ago on a phone I no longer have".
 *
 * The grant therefore lives where the transition is actually known: the admin panel detects
 * `nowAmbassador && !wasAmbassador` against the stored profile and calls the Notification function's
 * /send-badge-notification once per grant, and that handler awards the points server-side. Device
 * state can no longer cause a re-award.
 *
 * Caveat: flipping `isAmbassador` / `isInfluencer` directly in the Appwrite console bypasses that
 * endpoint, so it grants the badge without points. Toggle badges through the admin panel.
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

  const clientCreatedAwards: AwardedSpecialBadge[] = [];

  const maybeAnnounceBadge = async (badgeType: SpecialBadgeType, isEnabled: boolean) => {
    if (!isEnabled) {
      return;
    }

    // Primary trigger: badge flag changed from disabled -> enabled.
    // NOTE: `lastBadgeState` is a device-local cache, so this can also fire on a reinstall for a
    // badge granted long ago. That is now harmless — it only decides whether to surface a modal,
    // never whether to grant points.
    const transitionedToEnabled = !lastBadgeState[badgeType] && currentBadgeState[badgeType];
    // Backfill: badge is enabled but no historical special notification exists yet.
    const missingHistoricalNotification = !hasSpecialBadgeNotification(existingNotifications, badgeType);
    if (!transitionedToEnabled && !missingHistoricalNotification) {
      return;
    }

    // If the admin portal already issued a matching `badgeEarned` notification, use it
    // to drive the modal instead of creating a client-side duplicate.
    if (unreadAwards.some((a) => a.type === badgeType)) {
      return;
    }

    // Create client notification immediately for fresh transitions to ensure the popup
    // appears without delay. If a server notification arrives later, it will be
    // deduplicated by the notification system.
    if (transitionedToEnabled) {
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
        skipPush: true, // Don't send push since this is for immediate popup
      });

      clientCreatedAwards.push({
        type: badgeType,
        title: content.title,
        message: content.message,
        notificationId: createdNotification.id,
      });
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

  await maybeAnnounceBadge('ambassador', currentBadgeState.ambassador);
  await maybeAnnounceBadge('influencer', currentBadgeState.influencer);
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
