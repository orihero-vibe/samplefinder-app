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
  productTypes?: string[]; // Brand's product types from client.productType
}

interface UpcomingEventsProps {
  events: EventData[];
  /** When true, no events matched the selected filters; we show nearby events as suggestions. */
  isShowingNearbySuggestions?: boolean;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, isShowingNearbySuggestions = false }) => {
  const navigation = useNavigation<UpcomingEventsNavigationProp>();

  const handleEventPress = (event: UnifiedEvent) => {
    // Navigate to BrandDetailsScreen with eventId - it will fetch data from database
    navigation.navigate('BrandDetails', { eventId: event.id });
  };

  const sectionTitle = isShowingNearbySuggestions ? 'NEARBY EVENTS SUGGESTIONS' : 'UPCOMING EVENTS';
  const emptyMessage = isShowingNearbySuggestions
    ? 'No nearby events to suggest'
    : 'No upcoming events found';
  const emptySubtext = isShowingNearbySuggestions
    ? 'Try adjusting your filters or check back later'
    : 'Check back later for new events';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isShowingNearbySuggestions && styles.suggestionTitle]}>{sectionTitle}</Text>
      {isShowingNearbySuggestions && events.length > 0 && (
        <Text style={styles.suggestionSubtext}>No events match your filters. Here are events near you.</Text>
      )}
      <View style={styles.eventsContainer}>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{emptyMessage}</Text>
            <Text style={styles.emptyStateSubtext}>{emptySubtext}</Text>
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
  suggestionTitle: {
    color: Colors.grayText,
  },
  suggestionSubtext: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.grayText,
    paddingHorizontal: 20,
    paddingBottom: 8,
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

