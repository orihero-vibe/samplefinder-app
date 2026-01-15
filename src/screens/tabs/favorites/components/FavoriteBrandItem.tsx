import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { HeartIcon } from '@/icons';
import BrandUpcomingEvents from './BrandUpcomingEvents';
import type { EventData } from './BrandUpcomingEvents';
import SmallHeartIcon from '@/icons/SmallHeartIcon';

export interface FavoriteBrandData {
  id: string;
  brandName: string;
  description: string;
  brandPhotoURL?: string;
  events?: EventData[];
}

interface FavoriteBrandItemProps {
  brand: FavoriteBrandData;
  onToggleFavorite?: (id: string) => void;
}

const FavoriteBrandItem: React.FC<FavoriteBrandItemProps> = ({ brand, onToggleFavorite }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            {brand.brandPhotoURL ? (
              <Image 
                source={{ uri: brand.brandPhotoURL }} 
                style={styles.brandPhoto}
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
            <TouchableOpacity onPress={toggleExpand} style={styles.descriptionToggle}>
              <Text style={styles.descriptionText}>
                {isExpanded ? 'Close description' : 'Open description'}
              </Text>
              <Monicon
                name={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                size={16}
                color={Colors.black}
              />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onToggleFavorite?.(brand.id)}
          style={styles.heartButton}
        >
          <SmallHeartIcon size={24} />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.description}>{brand.description}</Text>
          {brand.events && brand.events.length > 0 && (
            <BrandUpcomingEvents events={brand.events} />
          )}
        </View>
      )}

      {!isExpanded && brand.events && brand.events.length > 0 && (
        <View style={styles.collapsedEvents}>
          <BrandUpcomingEvents events={brand.events} />
        </View>
      )}

      <View style={styles.separator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
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
    overflow: 'hidden',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandPhoto: {
    width: 40,
    height: 40,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
    marginBottom: 4,
  },
  descriptionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  descriptionText: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
  },
  heartButton: {
    padding: 5,
  },
  expandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    lineHeight: 20,
    marginBottom: 15,
  },
  collapsedEvents: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 72,
  },
});

export default FavoriteBrandItem;

