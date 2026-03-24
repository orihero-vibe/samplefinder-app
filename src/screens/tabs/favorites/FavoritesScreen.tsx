import React, { useCallback, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import MainHeader from '@/components/wrappers/MainHeader';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import { Colors } from '@/constants/Colors';
import { HeartIcon } from '@/icons';
import {
  FavoriteBrandItem,
  FindNewFavorites,
} from './components';
import { useFavoritesScreen } from './useFavoritesScreen';
import styles from './styles';

const FavoritesScreen = () => {
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const {
    favorites,
    newBrands,
    isLoading,
    isRefreshing,
    pendingUnfavorite,
    isUnfavoriting,
    handleRequestUnfavorite,
    handleCancelUnfavorite,
    handleConfirmUnfavorite,
    handleToggleNewFavorite,
    handleRefresh,
  } = useFavoritesScreen();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <MainHeader showLeftIcons={false} />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.pinDarkBlue}
            colors={[Colors.pinDarkBlue]}
          />
        }
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
                    onUnfavoritePress={handleRequestUnfavorite}
                  />
                ))
              )}
            </View>

            {/* Find New Favorites Section */}
            <FindNewFavorites brands={newBrands} onToggleFavorite={handleToggleNewFavorite} />
          </>
        )}
      </ScrollView>

      <ConfirmationModal
        visible={pendingUnfavorite !== null}
        title="Remove from favorites?"
        description={
          pendingUnfavorite
            ? `Are you sure you want to unfavorite ${pendingUnfavorite.brandName}? You can add this brand back anytime.`
            : ''
        }
        confirmText="Yes, Unfavorite"
        cancelText="Cancel"
        onConfirm={handleConfirmUnfavorite}
        onCancel={handleCancelUnfavorite}
        isLoading={isUnfavoriting}
        loadingText="Updating..."
      />
    </View>
  );
};

export default FavoritesScreen;
