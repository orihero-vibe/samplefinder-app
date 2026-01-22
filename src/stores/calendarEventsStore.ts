import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  addEventToUserCalendar, 
  removeEventFromUserCalendar, 
  getUserSavedEventIds 
} from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

interface SavedCalendarEvent {
  eventId: string;
  addedAt: string; // ISO timestamp
}

interface CalendarEventsState {
  savedEvents: SavedCalendarEvent[];
  isInitialized: boolean;
  addSavedEvent: (eventId: string) => Promise<void>;
  removeSavedEvent: (eventId: string) => Promise<void>;
  isSavedToCalendar: (eventId: string) => boolean;
  syncWithUserProfile: () => Promise<void>;
  clearAllSavedEvents: () => void;
}

export const useCalendarEventsStore = create<CalendarEventsState>()(
  persist(
    (set, get) => ({
      savedEvents: [],
      isInitialized: false,
      
      addSavedEvent: async (eventId: string) => {
        try {
          // Get current user
          const user = await getCurrentUser();
          if (!user) {
            throw new Error('User not authenticated');
          }

          // Add to database
          await addEventToUserCalendar(user.$id, eventId);
          
          // Update local store
          set((state) => {
            // Check if already exists
            const exists = state.savedEvents.some((e) => e.eventId === eventId);
            if (exists) {
              return state; // Already saved
            }
            // Add new saved event
            return {
              savedEvents: [
                ...state.savedEvents,
                {
                  eventId,
                  addedAt: new Date().toISOString(),
                },
              ],
            };
          });
        } catch (error) {
          console.error('[calendarEventsStore] Error adding event:', error);
          throw error;
        }
      },
      
      removeSavedEvent: async (eventId: string) => {
        try {
          // Get current user
          const user = await getCurrentUser();
          if (!user) {
            throw new Error('User not authenticated');
          }

          // Remove from database
          await removeEventFromUserCalendar(user.$id, eventId);
          
          // Update local store
          set((state) => ({
            savedEvents: state.savedEvents.filter((e) => e.eventId !== eventId),
          }));
        } catch (error) {
          console.error('[calendarEventsStore] Error removing event:', error);
          throw error;
        }
      },
      
      isSavedToCalendar: (eventId: string) => {
        return get().savedEvents.some((e) => e.eventId === eventId);
      },
      
      syncWithUserProfile: async () => {
        try {
          // Get current user
          const user = await getCurrentUser();
          if (!user) {
            console.log('[calendarEventsStore] No user found, skipping sync');
            set({ isInitialized: true });
            return;
          }

          // Fetch full user profile to get savedEventIds with timestamps
          const { getUserProfile } = await import('@/lib/database');
          const profile = await getUserProfile(user.$id);
          
          if (!profile) {
            console.log('[calendarEventsStore] No profile found, skipping sync');
            set({ isInitialized: true });
            return;
          }

          const savedEvents = profile.savedEventIds || [];
          
          set({ savedEvents, isInitialized: true });
          console.log('[calendarEventsStore] Synced events from user profile:', savedEvents.length);
        } catch (error) {
          console.error('[calendarEventsStore] Error syncing with user profile:', error);
          set({ isInitialized: true });
        }
      },
      
      clearAllSavedEvents: () => {
        set({ savedEvents: [] });
      },
    }),
    {
      name: 'calendar-events-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
