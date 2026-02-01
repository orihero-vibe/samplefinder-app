import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  addEventToUserCalendar, 
  removeEventFromUserCalendar, 
  getUserSavedEventIds 
} from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { 
  scheduleEventReminders, 
  getEventReminders, 
  cancelEventReminders 
} from '@/lib/notifications/eventReminders';

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
          
          // Cancel any scheduled reminders for this event
          await cancelEventReminders(eventId);
          
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
          const { getUserProfile, fetchEventById } = await import('@/lib/database');
          const profile = await getUserProfile(user.$id);
          
          if (!profile) {
            console.log('[calendarEventsStore] No profile found, skipping sync');
            set({ isInitialized: true });
            return;
          }

          const savedEvents = profile.savedEventIds || [];
          
          set({ savedEvents, isInitialized: true });
          console.log('[calendarEventsStore] Synced events from user profile:', savedEvents.length);

          // Schedule reminders for saved events that don't have reminders yet
          // This ensures reminders work across devices
          for (const savedEvent of savedEvents) {
            try {
              // Check if reminders already exist for this event
              const existingReminders = await getEventReminders(savedEvent.eventId);
              if (existingReminders && (existingReminders.reminder24h || existingReminders.reminder1h)) {
                // Reminders already scheduled, skip
                continue;
              }

              // Fetch event details to get start time
              const eventData = await fetchEventById(savedEvent.eventId);
              if (!eventData || !eventData.startTime) {
                continue;
              }

              const eventStartDate = new Date(eventData.startTime);
              const now = new Date();

              // Only schedule if event is in the future
              if (eventStartDate > now) {
                const eventTitle = eventData.name || 'Event';
                const eventLocation = eventData.city ? `${eventData.address}, ${eventData.city}` : undefined;

                await scheduleEventReminders(
                  savedEvent.eventId,
                  eventStartDate,
                  eventTitle,
                  eventLocation
                );
                console.log('[calendarEventsStore] Scheduled reminders for event:', savedEvent.eventId);
              }
            } catch (reminderError) {
              console.warn('[calendarEventsStore] Failed to schedule reminder for event:', savedEvent.eventId, reminderError);
              // Continue with other events even if one fails
            }
          }
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
