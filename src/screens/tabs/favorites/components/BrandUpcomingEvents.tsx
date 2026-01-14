import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

// Standardized EventData interface matching other screens
export interface EventData {
  id: string;
  name: string;
  location: string;
  distance: string;
  date: Date | string; // Can be Date object or formatted string
  time: string;
  logoURL?: string | null;
  brandName?: string;
  // Legacy support: market field for backward compatibility
  market?: string;
}

interface BrandUpcomingEventsProps {
  events: EventData[];
}

const BrandUpcomingEvents: React.FC<BrandUpcomingEventsProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UPCOMING EVENTS:</Text>
      <View style={styles.eventsContainer}>
        {events.map((event) => {
          const dateStr = typeof event.date === 'string' ? event.date : event.date.toLocaleDateString();
          const locationName = event.location || 'Location TBD';
          const cityState = event.distance || ''; // Using distance field for city, state
          
          return (
            <Text key={event.id} style={styles.eventText}>
              {dateStr} | {locationName}{cityState ? ` | ${cityState}` : ''}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
    marginBottom: 8,
  },
  eventsContainer: {
    gap: 4,
  },
  eventText: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    lineHeight: 20,
  },
});

export default BrandUpcomingEvents;

