import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export interface EventData {
  id: string;
  date: string;
  market: string;
  location: string;
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
      {events.map((event, index) => (
        <View key={event.id} style={styles.eventItem}>
          <Text style={styles.eventText}>
            {event.date} {event.market} {event.location}
          </Text>
          {index < events.length - 1 && <View style={styles.eventSeparator} />}
        </View>
      ))}
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
  eventItem: {
    paddingVertical: 4,
  },
  eventText: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
  },
  eventSeparator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
});

export default BrandUpcomingEvents;

