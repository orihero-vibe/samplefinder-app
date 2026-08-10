import { PHONE_VERIFICATION_ENABLED as PHONE_VERIFICATION_ENABLED_ENV } from '@env';

/**
 * SMS phone-verification rollout flag, driven per environment.
 *
 * Set PHONE_VERIFICATION_ENABLED=true in the env file for the variant you want
 * it on in (.env.staging for the staging app, .env for production). Anything
 * other than the exact string "true" — including the variable being absent —
 * leaves the feature OFF, so the safe state is the default.
 *
 * Keep it FALSE in production until the Twilio SMS provider is configured in
 * the Appwrite Console AND the A2P 10DLC campaign is APPROVED. While false,
 * signup behaves exactly as before (email verification only) and no
 * phoneVerified writes or phone gating occur.
 *
 * Before flipping production to true, the `phoneVerified` attribute must be
 * deployed AND the grandfathering backfill re-run — see
 * samplefinder-admin/scripts/backfill-phone-verified.mjs.
 *
 * Note: the SMS consent checkbox at signup is intentionally NOT behind this
 * flag. A2P reviewers must be able to see the opt-in before the flag flips,
 * and consent has to be collected before any message is sent.
 */
export const PHONE_VERIFICATION_ENABLED =
  String(PHONE_VERIFICATION_ENABLED_ENV ?? '')
    .trim()
    .toLowerCase() === 'true';
