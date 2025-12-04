import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventData } from '@/screens/tabs/favorites/components/BrandUpcomingEvents';

export interface FavoriteBrandData {
  id: string;
  brandName: string;
  description: string;
  events?: EventData[];
  // Additional fields that might be needed
  storeName?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  products?: string[];
  imageUrl?: string;
  // Date and time for event-based favorites
  date?: string;
  time?: string;
  eventInfo?: string;
  discountMessage?: string;
}

interface FavoritesState {
  favorites: FavoriteBrandData[];
  addFavorite: (brand: FavoriteBrandData) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (brand: FavoriteBrandData) => void;
  updateFavorite: (id: string, updates: Partial<FavoriteBrandData>) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (brand) => {
        set((state) => {
          // Check if already exists
          if (state.favorites.some((f) => f.id === brand.id)) {
            return state;
          }
          return {
            favorites: [...state.favorites, brand],
          };
        });
      },
      
      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        }));
      },
      
      isFavorite: (id) => {
        return get().favorites.some((f) => f.id === id);
      },
      
      toggleFavorite: (brand) => {
        const isCurrentlyFavorite = get().isFavorite(brand.id);
        if (isCurrentlyFavorite) {
          get().removeFavorite(brand.id);
        } else {
          get().addFavorite(brand);
        }
      },
      
      updateFavorite: (id, updates) => {
        set((state) => ({
          favorites: state.favorites.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        }));
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

