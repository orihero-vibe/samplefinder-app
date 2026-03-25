import { getSetting } from '@/lib/database/settings';

export type ReferralShareConfig = {
  shareUrl: string;
  referrerPoints: number;
  refereePoints: number;
};

/**
 * Loads referral base URL and point amounts from settings; builds the universal link for sharing.
 */
export async function getReferralShareConfig(
  referralCode: string | null | undefined
): Promise<ReferralShareConfig> {
  const safeCode =
    referralCode && referralCode !== 'N/A' ? String(referralCode).trim() : '';
  const [baseRow, refRow, refeRow] = await Promise.all([
    getSetting('referral_base_url'),
    getSetting('referral_points_referrer'),
    getSetting('referral_points_referee'),
  ]);
  const baseUrl = (baseRow?.value || 'https://simplefinder.com').replace(/\/$/, '');
  const referrerPoints = Math.max(
    0,
    parseInt(String(refRow?.value ?? '100'), 10) || 100
  );
  const refereePoints = Math.max(
    0,
    parseInt(String(refeRow?.value ?? '100'), 10) || 100
  );
  const shareUrl = safeCode
    ? `${baseUrl}/referral/${safeCode.toUpperCase()}`
    : baseUrl;
  return { shareUrl, referrerPoints, refereePoints };
}
