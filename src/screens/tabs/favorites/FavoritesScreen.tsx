import React from 'react';
import { View, Text, ScrollView } from 'react-native';
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
    handleToggleFavorite,
    handleToggleNewFavorite,
  } = useFavoritesScreen();

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

export default FavoritesScreen;
