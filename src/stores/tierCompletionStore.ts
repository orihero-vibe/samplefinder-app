import { create } from 'zustand';
import type { Tier } from '@/screens/tabs/promotions/components';

type TriggerSource = 'checkin' | 'review' | 'trivia';

interface PendingTierCompletion {
  tier: Tier;
  points: number;
  source: TriggerSource;
}

interface TierCompletionState {
  shouldShowTierModal: boolean;
  completedTier: Tier | null;
  pointsEarned: number;
  triggerSource: TriggerSource | null;
  /** Stored when tier is completed from check-in/review; shown after earned modal closes */
  pendingTierCompletion: PendingTierCompletion | null;

  setTierCompleted: (tier: Tier, points: number, source: TriggerSource) => void;
  /** Call when PointsEarnedModal or BadgeEarnedModal closes to show tier modal if pending */
  showPendingTierModal: () => void;
  clearTierCompletion: () => void;
}

export const useTierCompletionStore = create<TierCompletionState>((set) => ({
  shouldShowTierModal: false,
  completedTier: null,
  pointsEarned: 0,
  triggerSource: null,
  pendingTierCompletion: null,

  setTierCompleted: (tier, points, source) =>
    set((state) => {
      // Check-in and review show an "earned" modal first; queue tier modal until it closes
      if (source === 'checkin' || source === 'review') {
        return {
          pendingTierCompletion: { tier, points, source },
          shouldShowTierModal: false,
        };
      }
      // Trivia has no earned modal; show tier modal immediately
      return {
        shouldShowTierModal: true,
        completedTier: tier,
        pointsEarned: points,
        triggerSource: source,
        pendingTierCompletion: null,
      };
    }),

  showPendingTierModal: () =>
    set((state) => {
      const pending = state.pendingTierCompletion;
      if (!pending) return state;
      return {
        shouldShowTierModal: true,
        completedTier: pending.tier,
        pointsEarned: pending.points,
        triggerSource: pending.source,
        pendingTierCompletion: null,
      };
    }),

  clearTierCompletion: () =>
    set({
      shouldShowTierModal: false,
      completedTier: null,
      pointsEarned: 0,
      triggerSource: null,
      pendingTierCompletion: null,
    }),
}));
