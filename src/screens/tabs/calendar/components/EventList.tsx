import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/Colors';
import { CalendarEventDetail } from './SelectedDateEvents';
import { EventCard, UnifiedEvent } from '@/components';
import { TabParamList } from '@/navigation/TabNavigator';
import { CalendarStackParamList } from '@/navigation/CalendarStack';

type EventListNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CalendarStackParamList, 'CalendarMain'>,
  BottomTabNavigationProp<TabParamList, 'Calendar'>
>;

interface EventListProps {
  events: CalendarEventDetail[];
  selectedDate: Date | null;
  showUpcoming?: boolean;
}

const EventList: React.FC<EventListProps> = ({ events, selectedDate, showUpcoming = false }) => {
  const navigation = useNavigation<EventListNavigationProp>();
  
  // Helper function to parse distance string to numeric value for sorting
  const parseDistance = (distanceStr: string): number => {
    if (distanceStr === 'Distance unknown') {
      return 999999; // Put unknown distances at the end
    }
    // Extract numeric value from strings like "2.5 mi away" or "450 ft away"
    const numericValue = parseFloat(distanceStr.replace(/[^\d.]/g, '')) || 999999;
    
    // Convert feet to miles for consistent comparison (5280 ft = 1 mile)
    if (distanceStr.includes('ft')) {
      return numericValue / 5280;
    }
    
    return numericValue;
  };
  
  // Filter events based on mode
  const filteredEvents = showUpcoming
    ? events.filter((event) => {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate >= today;
      }).sort((a, b) => {
        // First sort by date (ascending)
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        const dateDiff = dateA - dateB;
        
        // If dates are the same, sort by distance (closest first)
        if (dateDiff === 0) {
          const distA = parseDistance(a.distance);
          const distB = parseDistance(b.distance);
          return distA - distB;
        }
        
        return dateDiff;
      })
    : selectedDate
    ? events.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  const handleEventPress = (event: UnifiedEvent) => {
    // Navigate to BrandDetailsScreen with eventId - it will fetch data from database
    navigation.navigate('BrandDetails', { eventId: event.id });
  };

  if (filteredEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {showUpcoming ? 'No upcoming events' : 'No events for this date'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {filteredEvents.map((event) => {
        const unifiedEvent: UnifiedEvent = {
          id: event.id,
          name: event.name,
          brandName: event.brandName,
          location: event.location,
          distance: event.distance,
          time: event.time,
          date: event.date,
          logoURL: event.logoURL,
        };
        return (
          <EventCard
            key={event.id}
            event={unifiedEvent}
            onPress={handleEventPress}
            showDate={true}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
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
});

export default EventList;

