import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '@/constants/Colors';

const locationPin = require('@/assets/locationImage.png');

export interface StoreEventData {
  id: string;
  name: string;
  date: Date | string;
  time: string;
  logoURL?: string | null;
}

interface StoreEventCardProps {
  event: StoreEventData;
  onPress: (event: StoreEventData) => void;
}

const StoreEventCard: React.FC<StoreEventCardProps> = ({ event, onPress }) => {
  // Format date - handle both Date objects and strings
  let formattedDate: string;
  if (event.date instanceof Date) {
    formattedDate = event.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } else {
    // If it's already a formatted string, use it as is
    formattedDate = event.date;
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(event)}
      activeOpacity={0.7}
    >
      <View style={styles.eventItem}>
        <View style={styles.eventLeft}>
          <View style={[styles.logoContainer, event.logoURL && styles.logoContainerWithBg]}>
            {event.logoURL ? (
              <Image
                source={{ uri: event.logoURL }}
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={locationPin}
                style={styles.logoPlaceholder}
                resizeMode="contain"
              />
            )}
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.timeText}>{event.time}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainerWithBg: {
    backgroundColor: Colors.brandPurpleDeep,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  eventName: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandPurpleDeep,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.brandPurpleDeep,
    marginBottom: 2,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.brandPurpleDeep,
  },
});

export default StoreEventCard;
