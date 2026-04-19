import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExecutionMethod, ExecutionStatus } from 'react-native-appwrite';
import { functions } from './database/config';
import { APPWRITE_EVENTS_FUNCTION_ID } from '@env';
import {
  CUSTOM_SCHEME,
  DEEP_LINK_DOMAIN,
  REFERRAL_CODE_PATTERN,
  REFERRAL_PATH_PREFIX,
} from './deepLink.constants';

export const PENDING_REFERRAL_STORAGE_KEY = '@samplefinder_pending_referral_code';

const REFERRAL_CODE_REGEX = /^[A-Z2-9]{6}$/;

/**
 * If the user pasted a full SampleFinder referral URL (or app deep link), return the 6-char code.
 * Keeps referral.ts independent of deepLink.ts (which imports this module for storage).
 */
function referralCodeFromReferralUrl(value: string): string | null {
  if (!value) return null;
  try {
    const normalizedUrl = value.startsWith(`${CUSTOM_SCHEME}://`)
      ? value.replace(`${CUSTOM_SCHEME}://`, `https://${DEEP_LINK_DOMAIN}/`)
      : value;

    const parsed = new URL(normalizedUrl);
    if (parsed.hostname !== DEEP_LINK_DOMAIN) return null;

    const path = parsed.pathname;
    if (!path.startsWith(REFERRAL_PATH_PREFIX)) return null;

    const code = path
      .slice(REFERRAL_PATH_PREFIX.length)
      .replace(/\/$/, '')
      .toUpperCase();
    if (!REFERRAL_CODE_PATTERN.test(code)) return null;

    return code;
  } catch {
    return null;
  }
}

export function normalizeReferralCodeInput(value: string): string {
  const trimmed = value.trim();
  const fromUrl = referralCodeFromReferralUrl(trimmed);
  const raw = fromUrl ?? trimmed;
  return raw.toUpperCase().replace(/[^A-Z2-9]/g, '');
}

/** Optional field: empty ok; 1–5 chars ok while typing; 6 chars must match code charset. */
export function validateOptionalReferralCode(value: string): string | undefined {
  const normalized = normalizeReferralCodeInput(value);
  if (normalized.length === 0 || normalized.length < 6) {
    return undefined;
  }
  if (!REFERRAL_CODE_REGEX.test(normalized)) {
    return 'Invalid referral code';
  }
  return undefined;
}

export async function storePendingReferralCode(code: string | undefined | null): Promise<void> {
  const normalized = code ? normalizeReferralCodeInput(code) : '';
  if (!normalized || !REFERRAL_CODE_REGEX.test(normalized)) {
    await AsyncStorage.removeItem(PENDING_REFERRAL_STORAGE_KEY);
    return;
  }
  await AsyncStorage.setItem(PENDING_REFERRAL_STORAGE_KEY, normalized);
}

async function takePendingReferralCode(): Promise<string | null> {
  const v = await AsyncStorage.getItem(PENDING_REFERRAL_STORAGE_KEY);
  if (v) {
    await AsyncStorage.removeItem(PENDING_REFERRAL_STORAGE_KEY);
  }
  return v;
}

/**
 * After email verification: apply referral on the server (points + push).
 * Clears pending code from storage even on failure so users are not stuck retrying.
 */
export async function applyReferralAfterVerification(userId: string): Promise<void> {
  const code = await takePendingReferralCode();
  if (!code) {
    return;
  }

  const functionId = APPWRITE_EVENTS_FUNCTION_ID;
  if (!functionId) {
    console.warn('[referral] APPWRITE_EVENTS_FUNCTION_ID is not configured');
    return;
  }

  try {
    const execution = await functions.createExecution({
      functionId,
      body: JSON.stringify({ userId, referralCode: code }),
      async: false,
      xpath: '/apply-referral',
      method: ExecutionMethod.POST,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (execution.status === ExecutionStatus.Failed) {
      console.warn('[referral] apply-referral execution failed:', execution.responseBody);
      return;
    }

    if (execution.responseBody) {
      try {
        const parsed = JSON.parse(execution.responseBody) as {
          success?: boolean;
          error?: string;
        };
        if (parsed.success === false && parsed.error) {
          console.warn('[referral] apply-referral:', parsed.error);
        }
      } catch {
        // non-JSON response
      }
    }
  } catch (e: unknown) {
    console.warn('[referral] apply-referral request error:', e);
  }
}
