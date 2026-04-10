import { useState, useEffect } from 'react';
import { getSetting } from './database/settings';

const REFEREE_PTS_KEY = 'referral_points_referee';
const REFERRER_PTS_KEY = 'referral_points_referrer';

interface ReferralSettings {
  refereePts: number | null;
  referrerPts: number | null;
  isLoading: boolean;
}

/**
 * Fetches referral point values from the Appwrite Settings table.
 * Returns null for each value while loading or if the setting is missing.
 */
export function useReferralSettings(): ReferralSettings {
  const [refereePts, setRefereePts] = useState<number | null>(null);
  const [referrerPts, setReferrerPts] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const [refereeRow, referrerRow] = await Promise.all([
          getSetting(REFEREE_PTS_KEY),
          getSetting(REFERRER_PTS_KEY),
        ]);

        if (cancelled) return;

        if (refereeRow?.value) {
          const parsed = parseInt(refereeRow.value, 10);
          if (!isNaN(parsed)) setRefereePts(parsed);
        }
        if (referrerRow?.value) {
          const parsed = parseInt(referrerRow.value, 10);
          if (!isNaN(parsed)) setReferrerPts(parsed);
        }
      } catch (err) {
        console.warn('[useReferralSettings] Failed to fetch referral point settings:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchSettings();
    return () => { cancelled = true; };
  }, []);

  return { refereePts, referrerPts, isLoading };
}
