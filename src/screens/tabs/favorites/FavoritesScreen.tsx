import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import MainHeader from '@/components/wrappers/MainHeader';
import { Colors } from '@/constants/Colors';
import { HeartIcon } from '@/icons';
import {
  FavoriteBrandItem,
  FindNewFavorites,
} from './components';
import { useFavoritesScreen } from './useFavoritesScreen';
import styles from './styles';

const FavoritesScreen = () => {
  const {
    favorites,
    newBrands,
    isLoading,
    handleToggleFavorite,
    handleToggleNewFavorite,
  } = useFavoritesScreen();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <MainHeader showLeftIcons={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Favorites Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.heartIconContainer}>
              <HeartIcon size={60}   />
          </View>
          <Text style={styles.favoritesTitle}>FAVORITES</Text>
          <Text style={styles.motivationalText}>
            Never Forget The Brands You Love!{'\n'}Explore, Find More And Keep On{'\n'}Sampling!
          </Text>
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.pinDarkBlue} />
            <Text style={styles.loadingText}>Loading your favorites...</Text>
          </View>
        ) : (
          <>
            {/* Favorite Brands List */}
            <View style={styles.favoritesList}>
              {favorites.length === 0 ? (
                null
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
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default FavoritesScreen;
