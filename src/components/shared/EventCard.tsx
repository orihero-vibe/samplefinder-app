import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '@/constants/Colors';

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

  // Use name or product for display
  const eventName = event.name || event.product || 'Event';

  // Get brand name or location for placeholder text
  const placeholderText = event.brandName || eventName;

  return (
    <TouchableOpacity
      onPress={() => onPress(event)}
      activeOpacity={0.7}
    >
      <View style={styles.eventItem}>
        <View style={styles.eventLeft}>
          <View style={styles.logoContainer}>
            {event.logoURL ? (
              <Image
                source={{ uri: event.logoURL }}
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>
                  {placeholderText.substring(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventName}>{eventName}</Text>
            {event.brandName && event.brandName !== eventName && (
              <Text style={styles.brandName}>{event.brandName}</Text>
            )}
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
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  eventLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.orangeBA,
    marginRight: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.orangeBA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
    textAlign: 'center',
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  eventName: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandBlueBright,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.brandBlueBright,
    marginBottom: 4,
    opacity: 0.8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.brandBlueBright,
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.brandBlueBright,
  },
  eventRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  dateText: {
    fontSize: 13,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandBlueBright,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.brandBlueBright,
  },
});

export default EventCard;

