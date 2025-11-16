import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import MainHeader from '@/components/wrappers/MainHeader';
import { Colors } from '@/constants/Colors';
import { HeartIcon } from '@/icons';
import { useFavoritesStore } from '@/stores/favoritesStore';
import {
  FavoriteBrandItem,
  FindNewFavorites,
  NewBrandData,
} from './components';

// Sample new brands that can be discovered
const SAMPLE_NEW_BRANDS: Omit<NewBrandData, 'isFavorited'>[] = [
  {
    id: '4',
    brandName: 'Brand Name',
    description: 'Mini description or product list',
  },
  {
    id: '5',
    brandName: 'Brand Name',
    description: 'Mini description or product list',
  },
  {
    id: '6',
    brandName: 'Brand Name',
    description: 'Mini description or product list',
  },
  {
    id: '7',
    brandName: 'Brand Name',
    description: 'Mini description or product list',
  },
  {
    id: '8',
    brandName: 'Brand Name',
    description: 'Mini description or product list',
  },
];

const FavoritesScreen = () => {
  const favorites = useFavoritesStore((state) => state.favorites);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  // Get new brands that aren't favorited yet
  const newBrands = useMemo<NewBrandData[]>(() => {
    return SAMPLE_NEW_BRANDS.map((brand) => ({
      ...brand,
      isFavorited: isFavorite(brand.id),
    }));
  }, [favorites, isFavorite]);

  const handleToggleFavorite = (id: string) => {
    removeFavorite(id);
  };

  const handleToggleNewFavorite = (id: string) => {
    const brand = SAMPLE_NEW_BRANDS.find((b) => b.id === id);
    if (brand) {
      // Convert NewBrandData to FavoriteBrandData format
      const favoriteBrand = {
        id: brand.id,
        brandName: brand.brandName,
        description: brand.description,
      };
      toggleFavorite(favoriteBrand);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <MainHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Favorites Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.heartIconContainer}>
            <LinearGradient
              colors={[Colors.brandPurpleDeep, Colors.brandPurpleBright]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heartGradient}
            >
              <HeartIcon size={60} color={Colors.white} circleColor="transparent" />
            </LinearGradient>
          </View>
          <Text style={styles.favoritesTitle}>FAVORITES</Text>
          <Text style={styles.motivationalText}>
            Never Forget The Brands You Love!{'\n'}Explore, Find More And Keep On{'\n'}Sampling!
          </Text>
        </View>

        {/* Favorite Brands List */}
        <View style={styles.favoritesList}>
          {favorites.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No favorites yet. Start exploring and add brands you love!
              </Text>
            </View>
          ) : (
            favorites.map((brand) => (
              <FavoriteBrandItem
                key={brand.id}
                brand={brand}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          )}
        </View>

        {/* Find New Favorites Section */}
        <FindNewFavorites brands={newBrands} onToggleFavorite={handleToggleNewFavorite} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  heartIconContainer: {
    marginBottom: 15,
  },
  heartGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoritesTitle: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  motivationalText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 20,
  },
  favoritesList: {
    backgroundColor: Colors.white,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
    textAlign: 'center',
  },
});

export default FavoritesScreen;

