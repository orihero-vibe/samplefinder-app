import { useMemo, useEffect, useState } from 'react';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { NewBrandData } from './components';
import { fetchClients, fetchAllEvents, getUserProfile, addFavoriteBrand, removeFavoriteBrand, fetchCategories, CategoryData } from '@/lib/database';
import { convertClientsToBrands, filterEventsByAdultCategories } from '@/utils/brandUtils';
import { ClientData, EventRow } from '@/lib/database';
import { formatEventDate, formatEventTime } from '@/utils/formatters';
import type { EventData } from './components/BrandUpcomingEvents';
import { getCurrentUser } from '@/lib/auth';

export interface FavoriteBrandData {
  id: string;
  brandName: string;
  description: string;
  brandPhotoURL?: string;
  events?: EventData[];
}

export const useFavoritesScreen = () => {
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const addFavoriteToStore = useFavoritesStore((state) => state.addFavorite);
  const removeFavoriteFromStore = useFavoritesStore((state) => state.removeFavorite);
  const setFavorites = useFavoritesStore((state) => state.setFavorites);
  
  const [allBrands, setAllBrands] = useState<Omit<NewBrandData, 'isFavorited'>[]>([]);
  const [allClients, setAllClients] = useState<ClientData[]>([]);
  const [allEvents, setAllEvents] = useState<EventRow[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [userIsAdult, setUserIsAdult] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      }
      
      // Get current user and their favorites from database
      const authUser = await getCurrentUser();
      let isAdult = false;
      if (authUser) {
        const userProfile = await getUserProfile(authUser.$id);
        if (userProfile) {
          if (userProfile.favoriteIds) {
            // Sync favorites from database to store
            setFavorites(userProfile.favoriteIds);
          }
          isAdult = userProfile.isAdult || false;
          setUserIsAdult(isAdult);
        }
      }
      
      // Fetch clients, events, and categories in parallel
      const [clients, events, allCategories] = await Promise.all([
        fetchClients(),
        fetchAllEvents(),
        fetchCategories(true), // Get all categories including adult ones for filtering
      ]);
      
      setCategories(allCategories);
      
      // Filter events based on user's adult status and category adult flags
      const filteredEvents = filterEventsByAdultCategories(events, allCategories, isAdult);
      
      setAllClients(clients);
      setAllEvents(filteredEvents);
      
      // Convert clients to brand data with product types from filtered events
      const brands = convertClientsToBrands(clients, filteredEvents);
      
      // Format description from product types
      const brandsWithDescription = brands.map((brand) => ({
        ...brand,
        description: brand.productTypes.length > 0
          ? brand.productTypes.join(', ')
          : 'No products listed',
      }));
      
      setAllBrands(brandsWithDescription);
    } catch (error) {
      console.error('[useFavoritesScreen] Error loading data:', error);
      setAllBrands([]);
      setAllClients([]);
      setAllEvents([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load user's favorite IDs from database and fetch all brands/events
  useEffect(() => {
    loadData();
  }, [setFavorites]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(true);
  };

  // Get favorite brands with their details and events
  const favoriteBrands = useMemo<FavoriteBrandData[]>(() => {
    const brands: FavoriteBrandData[] = [];
    
    for (const brandId of favoriteIds) {
      // Find the client/brand by ID
      const client = allClients.find((c) => c.$id === brandId);
      if (!client) continue;
      
      const brandName = client.name || client.title || 'Brand';
      
      // Get brand data to find product types
      const brandData = allBrands.find((b) => b.id === brandId);
      
      // Find all upcoming events for this brand
      const brandEvents = allEvents
        .filter((event) => {
          const clientId = typeof event.client === 'string' 
            ? event.client 
            : event.client?.$id;
          return clientId === brandId;
        })
        .filter((event) => new Date(event.date) >= new Date()) // Only upcoming events
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3) // Limit to 3 upcoming events
        .map((event): EventData => {
          const eventClient = typeof event.client !== 'string' ? event.client : null;
          const location = eventClient?.name || eventClient?.title || event.address || 'Location TBD';
          
          // Get city and state from event
          const city = event.city || eventClient?.city || '';
          const state = event.state || eventClient?.state || '';
          
          return {
            id: event.$id,
            name: event.name || brandName,
            brandName: brandName,
            location,
            distance: city && state ? `${city}, ${state}` : (city || state || ''), // Use distance field for city, state
            date: formatEventDate(event.date),
            time: formatEventTime(event.startTime, event.endTime),
            logoURL: client.logoURL || null, // Brand logo from client
          };
        });
      
      brands.push({
        id: brandId,
        brandName,
        description: brandData?.description || brandData?.productTypes?.join(', ') || 'No products listed',
        brandPhotoURL: client.logoURL || undefined,
        events: brandEvents.length > 0 ? brandEvents : undefined,
      });
    }
    
    return brands;
  }, [favoriteIds, allClients, allBrands, allEvents]);

  // Get new brands that aren't favorited yet
  const newBrands = useMemo<NewBrandData[]>(() => {
    return allBrands
      .filter((brand) => !isFavorite(brand.id))
      .map((brand) => ({
        ...brand,
        isFavorited: isFavorite(brand.id),
      }));
  }, [allBrands, isFavorite, favoriteIds]);

  const handleToggleFavorite = async (brandId: string) => {
    try {
      // Remove from local store immediately (optimistic update)
      removeFavoriteFromStore(brandId);
      
      // Sync with database
      const authUser = await getCurrentUser();
      if (authUser) {
        await removeFavoriteBrand(authUser.$id, brandId);
      }
    } catch (error) {
      console.error('[useFavoritesScreen] Error removing favorite:', error);
      // Revert optimistic update if database sync fails
      addFavoriteToStore(brandId);
    }
  };

  const handleToggleNewFavorite = async (brandId: string) => {
    try {
      const isCurrentlyFavorite = isFavorite(brandId);
      
      if (isCurrentlyFavorite) {
        // Remove favorite
        removeFavoriteFromStore(brandId);
        
        const authUser = await getCurrentUser();
        if (authUser) {
          await removeFavoriteBrand(authUser.$id, brandId);
        }
      } else {
        // Add favorite
        addFavoriteToStore(brandId);
        
        const authUser = await getCurrentUser();
        if (authUser) {
          await addFavoriteBrand(authUser.$id, brandId);
        }
      }
    } catch (error) {
      console.error('[useFavoritesScreen] Error toggling favorite:', error);
      // Revert optimistic update if database sync fails
      const isCurrentlyFavorite = isFavorite(brandId);
      if (isCurrentlyFavorite) {
        removeFavoriteFromStore(brandId);
      } else {
        addFavoriteToStore(brandId);
      }
    }
  };

  return {
    favorites: favoriteBrands,
    newBrands,
    isLoading,
    isRefreshing,
    handleToggleFavorite,
    handleToggleNewFavorite,
    handleRefresh,
  };
};

