import { create } from 'zustand';

interface Tier1ModalState {
  shouldShowTier1Modal: boolean;
  setShouldShowTier1Modal: (value: boolean) => void;
}

export const useTier1ModalStore = create<Tier1ModalState>((set) => ({
  shouldShowTier1Modal: false,
  setShouldShowTier1Modal: (value) => set({ shouldShowTier1Modal: value }),
}));
