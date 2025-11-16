import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';

interface CalendarEvent {
  id: string;
  date: Date;
  title?: string;
  location?: string;
}

interface EventListProps {
  events: CalendarEvent[];
  selectedDate: Date | null;
}

const EventList: React.FC<EventListProps> = ({ events, selectedDate }) => {
  // Filter events for selected date or show all if no date selected
  const filteredEvents = selectedDate
    ? events.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : events;

  if (filteredEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {selectedDate ? 'No events for this date' : 'No events scheduled'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {filteredEvents.map((event) => (
        <View key={event.id} style={styles.eventItem}>
          <View style={styles.eventContent}>
            <Text style={styles.eventDate}>
              {new Date(event.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            {event.title && <Text style={styles.eventTitle}>{event.title}</Text>}
            {event.location && (
              <Text style={styles.eventLocation}>{event.location}</Text>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
  },
  eventItem: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventContent: {
    gap: 4,
  },
  eventDate: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandBlueBright,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandPurpleDeep,
    marginTop: 4,
  },
  eventLocation: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
  },
});

export default EventList;

