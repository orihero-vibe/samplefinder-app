import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

export interface HistoryItemData {
  id: string;
  brandProduct: string;
  storeName: string;
  date: string; // Format: "Aug 1, 2025"
  points: number;
  review?: string;
  brandPhotoURL?: string | null;
}

interface HistoryItemProps {
  item: HistoryItemData;
  defaultExpanded?: boolean;
  isLastItem?: boolean;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, defaultExpanded = false, isLastItem = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={[styles.container, isLastItem && styles.lastItem]}>
      <View style={styles.content}>
        {/* Icon and Main Info */}
        <View style={styles.mainRow}>
          <View style={styles.iconContainer}>
            {item.brandPhotoURL ? (
              <Image 
                source={{ uri: item.brandPhotoURL }} 
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
          <View style={styles.infoContainer}>
            <Text style={styles.brandProduct}>{item.brandProduct}</Text>
            <Text style={styles.storeName}>{item.storeName}</Text>
            <View style={styles.datePointsRow}>
              <Text style={styles.date}>{item.date}</Text>
              {item.review ? (
                <>
                  <Text style={styles.separator}>|</Text>
                  <Text style={styles.points}>{item.points} Points</Text>
                  <Text style={styles.separator}>|</Text>
                  <TouchableOpacity style={styles.reviewToggleInline} onPress={toggleExpand}>
                    <Text style={styles.reviewToggleText}>
                      {isExpanded ? 'Close review' : 'See review'}
                    </Text>
                    <Monicon
                      name={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                      size={16}
                      color={Colors.black}
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.bulletSeparator} />
                  <Text style={styles.points}>{item.points} Points</Text>
                  <View style={styles.bulletSeparator} />
                </>
              )}
            </View>
          </View>
        </View>

        {/* Expanded Review */}
        {isExpanded && item.review && (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewText}>{item.review}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingVertical: 16,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  content: {
    backgroundColor: 'transparent',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  brandPhoto: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  magnifierOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  brandProduct: {
    fontSize: 17,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
    marginBottom: 2,
  },
  storeName: {
    fontSize: 15,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    marginBottom: 6,
  },
  datePointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  date: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
  },
  separator: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    marginHorizontal: 6,
  },
  bulletSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.black,
    marginHorizontal: 8,
  },
  points: {
    fontSize: 13,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
  },
  reviewToggleInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewToggleText: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    marginRight: 4,
  },
  reviewContainer: {
    marginTop: 6,
    paddingLeft: 62
  },
  reviewText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    lineHeight: 20,
  },
});

export default HistoryItem;

