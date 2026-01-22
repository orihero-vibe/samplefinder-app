import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { HeartIcon } from '@/icons';
import SmallHeartIcon from '@/icons/SmallHeartIcon';
import HeartOutlineIcon from '@/icons/HeartOutlineIcon';

export interface NewBrandData {
  id: string;
  brandName: string;
  description: string;
  productTypes: string[];
  createdAt: string;
  logoURL?: string | null;
  isFavorited?: boolean;
}

interface FindNewFavoritesProps {
  brands: NewBrandData[];
  onToggleFavorite?: (id: string) => void;
}

const FindNewFavorites: React.FC<FindNewFavoritesProps> = ({ brands, onToggleFavorite }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find New Favorites!</Text>
      {brands.map((brand) => (
        <TouchableOpacity
          key={brand.id}
          style={styles.brandItem}
          onPress={() => onToggleFavorite?.(brand.id)}
          activeOpacity={0.7}
        >
          <View style={styles.leftSection}>
            <View style={styles.logoContainer}>
              {brand.logoURL ? (
                <Image
                  source={{ uri: brand.logoURL }}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                source={require('@/assets/locationImage.png')}
                style={styles.brandPhoto}
                resizeMode="contain"
              />
              )}
            </View>
            <View style={styles.brandInfo}>
              <Text style={styles.brandName}>{brand.brandName}</Text>
              <Text style={styles.description}>
                {brand.productTypes && brand.productTypes.length > 0
                  ? brand.productTypes.join(', ').length > 35 ? brand.productTypes.join(', ').slice(0, 35) + '...' : brand.productTypes.join(', ')
                  : brand.description?.slice(0, 30) + '...'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => onToggleFavorite?.(brand.id)}
            style={styles.heartButton}
          >
            <HeartOutlineIcon size={24}/>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingTop: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  brandItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  logoContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,

  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  brandPhoto: {
    width: 40,
    height: 40,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.pinDarkBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
  },
  heartButton: {
    padding: 5,
  },
});

export default FindNewFavorites;

