import { create } from 'zustand';
import { getCurrentUser, type User } from '@/lib/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  fetchUser: () => Promise<User | null>;
  clearUser: () => void;
  getUser: () => User | null;
}

/**
 * In-flight promise used for deduplication.
 * If `fetchUser()` is already running, subsequent calls return the same promise
 * instead of hitting the Appwrite API again.
 */
let inflight: Promise<User | null> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  fetchUser: () => {
    if (inflight) {
      return inflight;
    }

    inflight = getCurrentUser()
      .then((user) => {
        set({ user, isLoading: false });
        return user;
      })
      .catch((error) => {
        console.error('[authStore] Error fetching user:', error);
        set({ user: null, isLoading: false });
        return null;
      })
      .finally(() => {
        inflight = null;
      });

    return inflight;
  },

  clearUser: () => {
    set({ user: null, isLoading: false });
  },

  getUser: () => {
    return get().user;
  },
}));
