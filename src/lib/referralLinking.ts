import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Single key for pending referral code until claim succeeds */
export const PENDING_REFERRAL_KEY = '@samplefinder/pendingReferralCode';

const CODE_RE = /^[A-Z0-9]{4,32}$/;

export async function storePendingReferralCode(code: string): Promise<void> {
  const normalized = code.trim().toUpperCase();
  if (!CODE_RE.test(normalized)) {
    return;
  }
  await AsyncStorage.setItem(PENDING_REFERRAL_KEY, normalized);
}

export async function getPendingReferralCode(): Promise<string | null> {
  return AsyncStorage.getItem(PENDING_REFERRAL_KEY);
}

export async function clearPendingReferralCode(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_REFERRAL_KEY);
}

/**
 * Extract referral code from a universal link, app link, or custom scheme URL.
 */
export function parseReferralCodeFromUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }
  try {
    const match = url.match(/\/referral\/([A-Za-z0-9]+)/i);
    if (match?.[1]) {
      const c = match[1].toUpperCase();
      return CODE_RE.test(c) ? c : null;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Read cold-start URL and persist referral code if present.
 */
export async function captureInitialReferralUrl(): Promise<void> {
  const initial = await Linking.getInitialURL();
  const code = parseReferralCodeFromUrl(initial);
  if (code) {
    await storePendingReferralCode(code);
  }
}

export function subscribeReferralUrls(
  onCode: (code: string) => void
): { remove: () => void } {
  const sub = Linking.addEventListener('url', ({ url }) => {
    const code = parseReferralCodeFromUrl(url);
    if (code) {
      onCode(code);
    }
  });
  return { remove: () => sub.remove() };
}
