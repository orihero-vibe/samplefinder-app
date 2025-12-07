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
        {events.map((event) => {
          const unifiedEvent: UnifiedEvent = {
            id: event.id,
            name: event.name,
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  eventsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
});

export default UpcomingEvents;

