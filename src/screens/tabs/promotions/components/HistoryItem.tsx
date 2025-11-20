import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

export interface HistoryItemData {
  id: string;
  brandProduct: string;
  storeName: string;
  date: string; // Format: "Aug 1, 2025"
  points: number;
  review?: string;
}

interface HistoryItemProps {
  item: HistoryItemData;
  defaultExpanded?: boolean;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon and Main Info */}
        <View style={styles.mainRow}>
          <View style={styles.iconContainer}>
            <Monicon name="mdi:map-marker" size={24} color={Colors.pinDarkBlue} />
            <View style={styles.magnifierOverlay}>
              <Monicon name="mdi:magnify" size={12} color={Colors.pinDarkBlue} />
            </View>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.brandProduct}>{item.brandProduct}</Text>
            <Text style={styles.storeName}>{item.storeName}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
          <View style={styles.pointsContainer}>
            <Text style={styles.points}>{item.points} Points</Text>
          </View>
        </View>

        {/* Review Toggle */}
        {item.review && (
          <TouchableOpacity style={styles.reviewToggle} onPress={toggleExpand}>
            <Text style={styles.reviewToggleText}>
              {isExpanded ? 'Close review' : 'See review'}
            </Text>
            <Monicon
              name={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
              size={20}
              color={Colors.pinDarkBlue}
            />
          </TouchableOpacity>
        )}

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
    marginBottom: 16,
  },
  content: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  magnifierOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 2,
  },
  infoContainer: {
    flex: 1,
  },
  brandProduct: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
  },
  reviewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  reviewToggleText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.pinDarkBlue,
    marginRight: 8,
  },
  reviewContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  reviewText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    lineHeight: 20,
  },
});

export default HistoryItem;

