import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/Colors';
import { EventCard, UnifiedEvent } from '@/components';
import { TabParamList } from '@/navigation/TabNavigator';
import { CalendarStackParamList } from '@/navigation/CalendarStack';

type SelectedDateEventsNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CalendarStackParamList, 'CalendarMain'>,
  BottomTabNavigationProp<TabParamList, 'Calendar'>
>;

export interface CalendarEventDetail {
  id: string;
  date: Date;
  name: string;
  brandName?: string;
  location: string;
  distance: string;
  time: string;
  logoURL?: string | null;
  /**
   * Alternative logo format for generating placeholder logos when logoURL is not available.
   * Currently not used by EventCard (which uses logoURL), but reserved for future use
   * to display branded placeholder logos with custom colors and text.
   */
  logo?: {
    backgroundColor: string;
    text?: string;
    icon?: string;
  };
}

interface SelectedDateEventsProps {
  events: CalendarEventDetail[];
  selectedDate: Date | null;
}

const SelectedDateEvents: React.FC<SelectedDateEventsProps> = ({
  events,
  selectedDate,
}) => {
  const navigation = useNavigation<SelectedDateEventsNavigationProp>();

  if (!selectedDate) {
    return null;
  }

  // Filter events for selected date
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  if (filteredEvents.length === 0) {
    return null;
  }

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleEventPress = (event: UnifiedEvent) => {
    // Navigate to BrandDetailsScreen with eventId - it will fetch data from database
    navigation.navigate('BrandDetails', { eventId: event.id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.separator} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
});

export default SelectedDateEvents;

