import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';
import { fetchAllUpcomingEvents, EventRow, fetchClients, ClientData } from '@/lib/database';
import { convertEventToCalendarEventDetail, extractClientFromEvent } from '@/utils/brandUtils';
import { formatEventTime } from '@/utils/formatters';
import { calculateDistance } from '@/utils/formatters';
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

  // Get user's current location for distance calculation
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('[DiscoverEventsScreen] Location permission denied');
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
        console.error('[DiscoverEventsScreen] Error getting location:', error);
      }
    };

    getCurrentLocation();
  }, []);

  // Fetch all upcoming events from Appwrite
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all upcoming events from database
        const eventRows = await fetchAllUpcomingEvents();

        // Fetch all clients to get client data for events
        const allClients = await fetchClients();

        // Convert EventRow to EventWithClient format
        const eventsWithClient: EventWithClient[] = eventRows.map((event: EventRow) => {
          // Extract client from event relationship
          let client: ClientData | null = extractClientFromEvent(event);

          // If client not in relationship, try to find it from allClients
          if (!client && event.client) {
            const clientId = typeof event.client === 'string' ? event.client : event.client.$id;
            if (clientId) {
              client = allClients.find((c) => c.$id === clientId) || null;
            }
          }

          // Get event name (title)
          const eventName = event.name || 'Event';
          
          // Get brand/client name (subtitle)
          const brandName = client?.name || client?.title || 'Brand';

          // Get location name from client, fallback to event address
          const location = client?.name || client?.title || event.address || 'Location TBD';

          // Calculate distance if user location is provided
          let distance = 'Distance unknown';
          if (userLocation && client?.location) {
            const distanceMeters = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              client.location[1], // latitude
              client.location[0]  // longitude
            );
            const distanceMiles = distanceMeters / 1609.34;
            if (distanceMiles < 0.1) {
              distance = `${(distanceMiles * 5280).toFixed(0)} ft away`;
            } else {
              distance = `${distanceMiles.toFixed(2)} mi away`;
            }
          }

          // Format time from ISO to "3 - 5 pm"
          const time = formatEventTime(event.startTime, event.endTime);

          // Get logo URL - prioritize discountImageURL over client.logoURL
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

        // Sort events by date (ascending)
        eventsWithClient.sort((a, b) => {
          return a.date.getTime() - b.date.getTime();
        });

        setEvents(eventsWithClient);
      } catch (err: any) {
        console.error('[DiscoverEventsScreen] Error loading events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [userLocation]); // Reload when user location changes

  const handleEventPress = (eventId: string) => {
    // Navigate to BrandDetailsScreen with eventId
    navigation.navigate('BrandDetails', { eventId });
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Trigger reload by updating a dependency
    setUserLocation(userLocation);
  };

  // Convert events to UnifiedEvent format for rendering
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

