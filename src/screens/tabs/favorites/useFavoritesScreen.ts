import { useMemo, useEffect, useState } from 'react';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { NewBrandData } from './components';
import { fetchClients, fetchAllEvents } from '@/lib/database';
import { convertClientsToBrands } from '@/utils/brandUtils';
import { ClientData, EventRow } from '@/lib/database';

export const useFavoritesScreen = () => {
  const favorites = useFavoritesStore((state) => state.favorites);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  
  const [allBrands, setAllBrands] = useState<Omit<NewBrandData, 'isFavorited'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all clients (brands) and their events to get product types
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setIsLoading(true);
        
        // Fetch clients and events in parallel
        const [clients, events] = await Promise.all([
          fetchClients(),
          fetchAllEvents(),
        ]);
        
        // Convert clients to brand data with product types from events
        const brands = convertClientsToBrands(clients, events);
        
        // Format description from product types
        const brandsWithDescription = brands.map((brand) => ({
          ...brand,
          description: brand.productTypes.length > 0
            ? brand.productTypes.join(', ')
            : 'No products listed',
        }));
        
        setAllBrands(brandsWithDescription);
      } catch (error) {
        console.error('[useFavoritesScreen] Error loading brands:', error);
        setAllBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBrands();
  }, []);

  // Check if a brand is favorited by ID or brand name
  const isBrandFavorited = useMemo(() => {
    return (brandId: string, brandName: string) => {
      // Check by ID first
      if (isFavorite(brandId)) return true;
      // Also check by brand name to catch favorites added from brand details (which use event IDs)
      return favorites.some((f) => f.brandName.toLowerCase() === brandName.toLowerCase());
    };
  }, [favorites, isFavorite]);

  // Get new brands that aren't favorited yet, sorted by creation date
  const newBrands = useMemo<NewBrandData[]>(() => {
    return allBrands
      .filter((brand) => !isBrandFavorited(brand.id, brand.brandName))
      .map((brand) => ({
        ...brand,
        isFavorited: isBrandFavorited(brand.id, brand.brandName),
      }));
  }, [allBrands, isBrandFavorited]);

  const handleToggleFavorite = (id: string) => {
    removeFavorite(id);
  };

  const handleToggleNewFavorite = (id: string) => {
    const brand = allBrands.find((b) => b.id === id);
    if (!brand) return;

    // Check if already favorited by brand name (in case it was favorited from brand details with event ID)
    const existingFavorite = favorites.find(
      (f) => f.brandName.toLowerCase() === brand.brandName.toLowerCase()
    );

    if (existingFavorite) {
      // Remove existing favorite (might have different ID)
      removeFavorite(existingFavorite.id);
    } else {
      // Add new favorite
      const favoriteBrand = {
        id: brand.id,
        brandName: brand.brandName,
        description: brand.description,
      };
      toggleFavorite(favoriteBrand);
    }
  };

  return {
    favorites,
    newBrands,
    isLoading,
    handleToggleFavorite,
    handleToggleNewFavorite,
  };
};

