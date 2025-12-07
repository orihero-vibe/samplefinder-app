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
  selectedDate: Date;
}

const EventList: React.FC<EventListProps> = ({ events, selectedDate }) => {
  const navigation = useNavigation<EventListNavigationProp>();
  
  // Filter events for the selected date only
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const handleEventPress = (event: UnifiedEvent) => {
    // Navigate to BrandDetailsScreen with eventId - it will fetch data from database
    navigation.navigate('BrandDetails', { eventId: event.id });
  };

  if (filteredEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No events for this date</Text>
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

