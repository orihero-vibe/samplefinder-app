import { ExecutionMethod } from 'react-native-appwrite';
import { functions } from './database/config';
import { APPWRITE_EVENTS_FUNCTION_ID } from '@env';
import { getCurrentUser } from './auth';
import { clearPendingReferralCode, getPendingReferralCode } from './referralLinking';

/**
 * Calls Mobile API POST /claim-referral with the current session (JWT forwarded by Appwrite).
 * Clears pending AsyncStorage code on success or benign duplicate.
 */
export async function claimPendingReferralIfNeeded(): Promise<void> {
  const code = await getPendingReferralCode();
  if (!code) {
    return;
  }

  const user = await getCurrentUser();
  if (!user?.emailVerification) {
    return;
  }

  const functionId = APPWRITE_EVENTS_FUNCTION_ID || '';
  if (!functionId) {
    console.warn('[referralClaim] APPWRITE_EVENTS_FUNCTION_ID is not configured');
    return;
  }

  try {
    const execution = await functions.createExecution({
      functionId,
      body: JSON.stringify({ referralCode: code }),
      method: ExecutionMethod.POST,
      xpath: '/claim-referral',
      headers: {
        'Content-Type': 'application/json',
      },
      async: false,
    });

    if (execution.status === 'failed') {
      console.warn('[referralClaim] Function execution failed:', execution.responseBody);
      return;
    }

    if (!execution.responseBody) {
      return;
    }

    const result = JSON.parse(execution.responseBody) as {
      success?: boolean;
      alreadyClaimed?: boolean;
      error?: string;
    };

    if (result.success || result.alreadyClaimed) {
      await clearPendingReferralCode();
      return;
    }

    console.warn('[referralClaim] Claim not successful:', result.error || execution.responseBody);
  } catch (e: unknown) {
    console.warn('[referralClaim] Error:', e);
  }
}
