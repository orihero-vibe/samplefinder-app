import { Linking, Alert } from 'react-native';
import {
  DEEP_LINK_DOMAIN,
  REFERRAL_PATH_PREFIX,
  CUSTOM_SCHEME,
  REFERRAL_CODE_PATTERN,
} from './deepLink.constants';
import { storePendingReferralCode } from './referral';
import { useAuthStore } from '@/stores/authStore';

/**
 * Parse a referral deep link URL and extract the referral code.
 *
 * Accepts:
 *   - https://samplefinder.com/referral/JNKLOW
 *   - com.samplefinder.app://referral/JNKLOW
 *
 * Returns the 6-char code or null if the URL is not a valid referral link.
 */
export function parseReferralDeepLink(url: string): string | null {
  if (!url) return null;

  try {
    // Handle custom scheme URLs by converting to a parseable format
    const normalizedUrl = url.startsWith(`${CUSTOM_SCHEME}://`)
      ? url.replace(`${CUSTOM_SCHEME}://`, `https://${DEEP_LINK_DOMAIN}/`)
      : url;

    const parsed = new URL(normalizedUrl);

    // Validate domain for https URLs (custom scheme was already normalized)
    if (parsed.hostname !== DEEP_LINK_DOMAIN) return null;

    // Extract referral code from path
    const path = parsed.pathname;
    if (!path.startsWith(REFERRAL_PATH_PREFIX)) return null;

    const code = path.slice(REFERRAL_PATH_PREFIX.length).replace(/\/$/, '').toUpperCase();
    if (!REFERRAL_CODE_PATTERN.test(code)) return null;

    return code;
  } catch {
    return null;
  }
}

/**
 * Build a shareable referral URL from a referral code.
 */
export function buildReferralUrl(code: string): string {
  return `https://${DEEP_LINK_DOMAIN}${REFERRAL_PATH_PREFIX}${code.toUpperCase()}`;
}

/**
 * Check if a URL looks like a referral deep link path (regardless of code validity).
 */
export function isReferralDeepLink(url: string): boolean {
  if (!url) return false;
  try {
    const normalizedUrl = url.startsWith(`${CUSTOM_SCHEME}://`)
      ? url.replace(`${CUSTOM_SCHEME}://`, `https://${DEEP_LINK_DOMAIN}/`)
      : url;
    const parsed = new URL(normalizedUrl);
    return (
      parsed.hostname === DEEP_LINK_DOMAIN &&
      parsed.pathname.startsWith(REFERRAL_PATH_PREFIX)
    );
  } catch {
    return false;
  }
}

/**
 * Handle an incoming referral deep link URL.
 *
 * - If user is NOT authenticated: stores the code for later use during signup.
 * - If user IS authenticated: shows an informational alert (referral codes are for new users only).
 *
 * Returns the parsed referral code if valid, or null.
 */
export async function handleIncomingReferralLink(url: string): Promise<string | null> {
  if (!isReferralDeepLink(url)) return null;

  const code = parseReferralDeepLink(url);

  try {
    const user = useAuthStore.getState().user;

    if (user) {
      Alert.alert(
        'Referral Link',
        'You already have an account! Share your own referral code with friends to earn points.',
      );
      return code;
    }
  } catch {
    // Not authenticated — fall through to store
  }

  if (code) {
    await storePendingReferralCode(code);
  }
  return code;
}

/**
 * Subscribe to deep link events while the app is running (warm/hot start).
 * Returns an unsubscribe function.
 */
export function subscribeToDeepLinks(
  onReferral: (code: string) => void,
): () => void {
  const subscription = Linking.addEventListener('url', async ({ url }) => {
    const code = await handleIncomingReferralLink(url);
    if (code) {
      onReferral(code);
    }
  });

  return () => subscription.remove();
}
