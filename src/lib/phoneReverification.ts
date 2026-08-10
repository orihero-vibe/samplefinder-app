// samplefinder-app/src/lib/phoneReverification.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tracks a phone re-verification that belongs to an ALREADY-onboarded user —
 * i.e. someone who changed their number from Edit Profile, not a new signup.
 *
 * ConfirmPhone is shared by both paths. On signup it must run
 * completeSignupOnboarding; on re-verification it must NOT, or the existing
 * user gets the Tier 1 welcome modal, a second "Welcome to SampleFinder!"
 * notification, and another referral application.
 *
 * A route param alone cannot carry this: if the user kills the app before
 * entering the code, the cold-start gate in AppNavigator re-opens ConfirmPhone
 * with no params at all. This flag survives that, and a genuine signup never
 * sets it.
 */
const storageKey = (userId: string) => `phoneReverificationPending:${userId}`;

export const markPhoneReverificationPending = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(storageKey(userId), 'true');
  } catch (error) {
    // Non-fatal: the route param still covers the common in-session path.
    console.warn('[phoneReverification] Failed to persist pending flag:', error);
  }
};

/**
 * Reads fail-safe rather than fail-open: on a storage error we report `false`,
 * which routes to the signup path. Skipping onboarding for a real new user
 * would cost them push registration and their referral code; re-showing a
 * welcome modal to an existing one is only cosmetic.
 */
export const isPhoneReverificationPending = async (userId: string): Promise<boolean> => {
  try {
    return (await AsyncStorage.getItem(storageKey(userId))) === 'true';
  } catch (error) {
    console.warn('[phoneReverification] Failed to read pending flag:', error);
    return false;
  }
};

export const clearPhoneReverification = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(storageKey(userId));
  } catch (error) {
    console.warn('[phoneReverification] Failed to clear pending flag:', error);
  }
};
