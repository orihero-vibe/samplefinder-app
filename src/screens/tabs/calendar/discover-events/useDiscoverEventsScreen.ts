import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';
import { fetchAllUpcomingEvents, EventRow, fetchClients, ClientData } from '@/lib/database';
import { convertEventToCalendarEventDetail, extractClientFromEvent } from '@/utils/brandUtils';
import { formatEventTime, formatEventDistance } from '@/utils/formatters';
import { TabParamList } from '@/navigation/TabNavigator';
import { CalendarStackParamList } from '@/navigation/CalendarStack';
import { UnifiedEvent } from '@/components';

interface EventWithClient {
  event: EventRow;
  client: ClientData | null;
  eventName: string;
  brandName: string;
  location: string;
  distance: string;
  time: string;
  date: Date;
  logoURL: string | null;
}

type DiscoverEventsNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CalendarStackParamList, 'CalendarMain'>,
  BottomTabNavigationProp<TabParamList, 'Calendar'>
>;

export const useDiscoverEventsScreen = () => {
  const navigation = useNavigation<DiscoverEventsNavigationProp>();
  const [events, setEvents] = useState<EventWithClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    getCurrentLocation();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [eventRows, allClients] = await Promise.all([
          fetchAllUpcomingEvents(),
          fetchClients(),
        ]);

        const eventsWithClient: EventWithClient[] = eventRows.map((event: EventRow) => {
          let client: ClientData | null = extractClientFromEvent(event);

          if (!client && event.client) {
            const clientId = typeof event.client === 'string' ? event.client : event.client.$id;
            if (clientId) {
              client = allClients.find((c) => c.$id === clientId) || null;
            }
          }

          const eventName = event.name || 'Event';
          const brandName = client?.name || client?.title || 'Brand';
          const location = client?.name || client?.title || event.address || 'Location TBD';

          const distance = formatEventDistance({
            userLocation: userLocation || undefined,
            eventCoordinates: client?.location 
              ? { latitude: client.location[0], longitude: client.location[1] }
              : undefined
          });

          const time = formatEventTime(event.startTime, event.endTime);
          const logoURL = event.discountImageURL || client?.logoURL || null;

          return {
            event,
            client,
            eventName,
            brandName,
            location,
            distance,
            time,
            date: new Date(event.date),
            logoURL,
          };
        });

        eventsWithClient.sort((a, b) => {
          return a.date.getTime() - b.date.getTime();
        });

        setEvents(eventsWithClient);
      } catch (err: any) {
        console.error('Error loading events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [userLocation]);

  const handleEventPress = (eventId: string) => {
    navigation.navigate('BrandDetails', { eventId });
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setUserLocation(userLocation);
  };

  const calendarEvents: UnifiedEvent[] = events.map((eventWithClient) => ({
    id: eventWithClient.event.$id,
    date: eventWithClient.date,
    name: eventWithClient.eventName,
    brandName: eventWithClient.brandName,
    location: eventWithClient.location,
    distance: eventWithClient.distance,
    time: eventWithClient.time,
    logoURL: eventWithClient.logoURL,
  }));

  return {
    calendarEvents,
    isLoading,
    error,
    handleEventPress,
    handleRetry,
  };
};

