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

type UpcomingEventsNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  BottomTabNavigationProp<TabParamList, 'Home'>
>;

export interface EventData {
  id: string;
  name: string;
  brandName?: string;
  location: string;
  distance: string;
  date: Date | string; // Can be Date object or formatted string
  time: string;
  logoURL?: string | null;
}

interface UpcomingEventsProps {
  events: EventData[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
  const navigation = useNavigation<UpcomingEventsNavigationProp>();

  const handleEventPress = (event: UnifiedEvent) => {
    // Navigate to BrandDetailsScreen with eventId - it will fetch data from database
    navigation.navigate('BrandDetails', { eventId: event.id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UPCOMING EVENTS</Text>
      <View style={styles.eventsContainer}>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No upcoming events found</Text>
            <Text style={styles.emptyStateSubtext}>Check back later for new events</Text>
          </View>
        ) : (
          events.map((event) => {
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
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  eventsContainer: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 20,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.blueColorMode,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.grayText,
  },
});

export default UpcomingEvents;

