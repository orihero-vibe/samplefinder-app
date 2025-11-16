import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { HeartIcon } from '@/icons';

export interface NewBrandData {
  id: string;
  brandName: string;
  description: string;
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
            <View style={styles.iconContainer}>
              <Monicon name="mdi:map-marker" size={20} color={Colors.pinDarkBlue} />
              <View style={styles.iconOverlay}>
                <Monicon name="mdi:magnify" size={12} color={Colors.white} />
              </View>
            </View>
            <View style={styles.brandInfo}>
              <Text style={styles.brandName}>{brand.brandName}</Text>
              <Text style={styles.description}>{brand.description}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => onToggleFavorite?.(brand.id)}
            style={styles.heartButton}
          >
            <HeartIcon
              size={24}
              color={Colors.pinDarkBlue}
              circleColor={brand.isFavorited ? Colors.pinDarkBlue : Colors.white}
              filled={brand.isFavorited}
            />
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.pinDarkBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
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

