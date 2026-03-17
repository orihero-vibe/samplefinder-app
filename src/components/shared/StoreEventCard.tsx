import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import RoundedLogoImage from './RoundedLogoImage';

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
          <RoundedLogoImage
            source={event.logoURL ? { uri: event.logoURL } : locationPin}
            width={80}
            height={80}
            backgroundColor={event.logoURL ? Colors.white : undefined}
            resizeMode={event.logoURL ? 'cover' : 'contain'}
            containerStyle={styles.logoContainer}
          />
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
    marginRight: 12,
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
