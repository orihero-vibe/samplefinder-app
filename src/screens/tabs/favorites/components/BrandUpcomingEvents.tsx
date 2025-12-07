import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/Colors';
import { EventCard, UnifiedEvent } from '@/components';
import { TabParamList } from '@/navigation/TabNavigator';
import { HomeStackParamList } from '@/navigation/HomeStack';

type BrandUpcomingEventsNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  BottomTabNavigationProp<TabParamList, 'Home'>
>;

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
  const navigation = useNavigation<BrandUpcomingEventsNavigationProp>();

  if (!events || events.length === 0) {
    return null;
  }

  const handleEventPress = (event: UnifiedEvent) => {
    // Navigate to BrandDetailsScreen with eventId
    navigation.navigate('BrandDetails', { eventId: event.id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UPCOMING EVENTS:</Text>
      <View style={styles.eventsContainer}>
        {events.map((event) => {
          // Map legacy market field to name if needed
          const eventName = event.name || event.market || 'Event';
          
          // Handle date - convert string to Date if needed
          let eventDate: Date | string = event.date;
          if (typeof eventDate === 'string' && !eventDate.includes('T')) {
            // If it's a formatted string without time, try to parse it
            // Otherwise keep as is for EventCard to handle
            eventDate = event.date;
          }

          const unifiedEvent: UnifiedEvent = {
            id: event.id,
            name: eventName,
            brandName: event.brandName,
            location: event.location,
            distance: event.distance || 'Distance unknown',
            time: event.time || 'Time TBD',
            date: eventDate,
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
    marginTop: 8,
  },
});

export default BrandUpcomingEvents;

