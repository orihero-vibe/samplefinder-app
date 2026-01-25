import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '@/constants/Colors';

const locationPin = require('@/assets/locationImage.png');

/**
 * Unified event interface that can represent events from different sources
 */
export interface UnifiedEvent {
  id: string;
  name?: string; // For CalendarEventDetail
  product?: string; // For EventData (home screen)
  brandName?: string;
  location: string;
  distance: string;
  time: string;
  date: Date | string; // Can be Date object or formatted string
  logoURL?: string | null;
}

interface EventCardProps {
  event: UnifiedEvent;
  onPress: (event: UnifiedEvent) => void;
  showDate?: boolean; // Whether to show the date in the right column
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress, showDate = true }) => {
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
  
  // Use brandName for display, fallback to eventName if no brand
  const displayBrandName = event.brandName || 'Brand';

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
                onError={(e) => console.log('[EventCard] Image load error:', e.nativeEvent.error, 'URL:', event.logoURL)}
                onLoad={() => console.log('[EventCard] Image loaded successfully:', event.logoURL?.substring(0, 50))}
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
            <Text style={styles.brandName}>{displayBrandName}</Text>
            <Text style={styles.locationText}>{event.location}</Text>
            <Text style={styles.distanceText}>{event.distance}</Text>
          </View>
        </View>
        {showDate && (
          <View style={styles.eventRight}>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.timeText}>{event.time}</Text>
          </View>
        )}
        {!showDate && (
          <View style={styles.eventRight}>
            <Text style={styles.timeText}>{event.time}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brandBlueBright + '20', // 20 is alpha for 12% opacity
  },
  eventLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 80,
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
    backgroundColor: Colors.orangeBA,
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
    gap: 4,
    paddingRight: 8,
  },
  eventName: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.brandBlueBright,
  },
  brandName: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandBlueBright,
  },
  locationText: {
    fontSize: 15,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.brandBlueBright,
  },
  distanceText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.brandBlueBright,
  },
  eventRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 12,
    flexShrink: 0,
    gap: 4,
  },
  dateText: {
    fontSize: 15,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandBlueBright,
  },
  timeText: {
    fontSize: 15,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.brandBlueBright,
  },
});

export default EventCard;

