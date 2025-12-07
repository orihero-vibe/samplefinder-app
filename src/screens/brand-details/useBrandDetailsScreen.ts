import { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Share, Alert, Linking } from 'react-native';
import * as Calendar from 'expo-calendar';
import * as Location from 'expo-location';
import { parseEventDateTime, calculateDistance } from '@/utils/formatters';
import { useFavoritesStore, FavoriteBrandData } from '@/stores/favoritesStore';
import { fetchEventById, fetchClients, EventRow, ClientData } from '@/lib/database';
import { convertEventToBrandDetails, extractClientFromEvent } from '@/utils/brandUtils';
import { HomeStackParamList } from '@/navigation/HomeStack';
import { TabParamList } from '@/navigation/TabNavigator';

export interface BrandDetailsData {
  id: string;
  brandName: string;
  storeName: string;
  date: string; // e.g., "Aug 1, 2025"
  time: string; // e.g., "3 - 5 pm"
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  products: string[];
  eventInfo: string;
  discountMessage?: string;
}

// BrandDetailsScreen can be accessed from either HomeStack or CalendarStack
// Use CompositeNavigationProp to combine stack and tab navigation
type BrandDetailsScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'BrandDetails'>,
  BottomTabNavigationProp<TabParamList>
>;

export type CheckInStatus = 'none' | 'input' | 'incorrect' | 'success';

interface BrandDetailsScreenProps {
  route: {
    params: { eventId?: string; brand?: BrandDetailsData };
  };
}

export const useBrandDetailsScreen = ({ route }: BrandDetailsScreenProps) => {
  const navigation = useNavigation<BrandDetailsScreenNavigationProp>();
  const { eventId, brand: brandParam } = route.params;
  
  // State for brand data and loading
  const [brand, setBrand] = useState<BrandDetailsData | null>(brandParam || null);
  const [isLoading, setIsLoading] = useState(!!eventId);
  const [error, setError] = useState<string | null>(null);
  const [checkInCode, setCheckInCode] = useState<string>('');
  
  // State for event location and timing data (for check-in validation)
  const [eventLocation, setEventLocation] = useState<[number, number] | null>(null); // [longitude, latitude]
  const [eventStartTime, setEventStartTime] = useState<Date | null>(null);
  const [eventEndTime, setEventEndTime] = useState<Date | null>(null);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);
  
  // State for user location
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  
  // Zustand favorites store - get favorites array to properly subscribe to changes
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  
  const [isAddedToCalendar, setIsAddedToCalendar] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>('none');
  const [hasSubmittedCode, setHasSubmittedCode] = useState(false);
  
  // Check-in radius in meters (100 meters = ~328 feet)
  const CHECK_IN_RADIUS_METERS = 100;
  
  // Fetch event data from database if eventId is provided
  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch event from database
        const event = await fetchEventById(eventId);
        if (!event) {
          setError('Event not found');
          setIsLoading(false);
          return;
        }
        
        // Extract client from event relationship
        let client = extractClientFromEvent(event);
        
        // If client not in relationship, try to fetch from client ID
        if (!client && event.client) {
          const clientId = typeof event.client === 'string' ? event.client : event.client.$id;
          if (clientId) {
            const allClients = await fetchClients();
            client = allClients.find((c) => c.$id === clientId) || null;
          }
        }
        
        // Store event location from client
        if (client?.location) {
          setEventLocation(client.location);
        }
        
        // Store event timing
        if (event.startTime) {
          setEventStartTime(new Date(event.startTime));
        }
        if (event.endTime) {
          setEventEndTime(new Date(event.endTime));
        }
        
        // Store brand logo URL (check multiple possible fields)
        const logoUrl = client?.logoURL || null;
        setBrandLogoUrl(logoUrl);
        
        // Convert to BrandDetailsData
        const brandData = convertEventToBrandDetails(event, client);
        setBrand(brandData);
        setCheckInCode(event.checkInCode || '');
      } catch (err: any) {
        console.error('[BrandDetailsScreen] Error loading event:', err);
        setError(err.message || 'Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    loadEventData();
  }, [eventId]);
  
  // Check if current brand is favorite
  const isFavorite = useMemo(() => {
    if (!brand) return false;
    return favorites.some((f) => f.id === brand.id);
  }, [favorites, brand]);
  
  // Convert BrandDetailsData to FavoriteBrandData format
  const favoriteBrandData: FavoriteBrandData | null = useMemo(() => {
    if (!brand) return null;
    return {
      id: brand.id,
      brandName: brand.brandName,
      description: brand.eventInfo || `${brand.brandName} at ${brand.storeName}`,
      storeName: brand.storeName,
      address: brand.address,
      products: brand.products,
      date: brand.date,
      time: brand.time,
      eventInfo: brand.eventInfo,
      discountMessage: brand.discountMessage,
    };
  }, [brand]);

  const handleTabPress = (tab: string) => {
    // Navigate to the appropriate tab
    const tabMap: Record<string, keyof TabParamList> = {
      home: 'Home',
      profile: 'Profile',
      favorites: 'Favorites',
      calendar: 'Calendar',
      promotions: 'Promotions',
    };
    const tabName = tabMap[tab];
    if (tabName) {
      // Navigate to the tab - the parent navigator will handle it
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate('MainTabs', { screen: tabName });
      }
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleShare = async () => {
    if (!brand) return;
    try {
      await Share.share({
        message: `Check out ${brand.brandName} at ${brand.storeName} on ${brand.date} from ${brand.time}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddToCalendar = async () => {
    // If already added, just toggle the state (could implement removal later)
    if (isAddedToCalendar) {
      setIsAddedToCalendar(false);
      return;
    }

    try {
      // First, check the current permission status
      const { status: currentStatus } = await Calendar.getCalendarPermissionsAsync();
      console.log('Current calendar permission status:', currentStatus);

      let finalStatus = currentStatus;

      // Only request permissions if status is undetermined
      // This ensures the native modal shows automatically on first request
      if (currentStatus === 'undetermined') {
        const { status: requestedStatus } = await Calendar.requestCalendarPermissionsAsync();
        console.log('Calendar permission status after request:', requestedStatus);
        finalStatus = requestedStatus;
      }

      // Handle different permission statuses
      if (finalStatus !== 'granted') {
        if (finalStatus === 'denied') {
          // Permission was previously denied - guide user to settings
          Alert.alert(
            'Calendar Access Required',
            'Please enable calendar access in your device settings to add events to your calendar.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  Linking.openSettings();
                },
              },
            ]
          );
        } else {
          // Permission was denied just now or other status
          Alert.alert(
            'Permission Needed',
            'Please grant calendar access to add events to your calendar.',
            [{ text: 'OK' }]
          );
        }
        return;
      }

      // Get available calendars
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      if (calendars.length === 0) {
        Alert.alert(
          'No Calendars',
          'No calendars are available on your device.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Find the default/primary calendar, or use the first available
      const defaultCalendar = calendars.find((cal) => cal.isPrimary) || calendars[0];
      if (!defaultCalendar.allowsModifications) {
        Alert.alert(
          'Calendar Not Writable',
          'The selected calendar does not allow modifications.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!brand) return;
      
      // Parse date and time
      let eventDates;
      try {
        eventDates = parseEventDateTime(brand.date, brand.time);
      } catch (error) {
        Alert.alert(
          'Invalid Date/Time',
          'Unable to parse the event date or time. Please check the event details.',
          [{ text: 'OK' }]
        );
        console.error('Error parsing date/time:', error);
        return;
      }

      // Format address string
      const addressString = `${brand.address.street}, ${brand.address.city}, ${brand.address.state} ${brand.address.zip}`;

      // Create calendar event
      const eventDetails = {
        title: `${brand.brandName} at ${brand.storeName}`,
        startDate: eventDates.start,
        endDate: eventDates.end,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
        location: addressString,
        notes: brand.eventInfo || `Sample sale event for ${brand.brandName}`,
      };

      const eventId = await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
      
      if (eventId) {
        setIsAddedToCalendar(true);
        Alert.alert(
          'Success',
          'Event added to your calendar!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      Alert.alert(
        'Error',
        'Failed to add event to calendar. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleAddFavorite = () => {
    if (favoriteBrandData) {
      toggleFavorite(favoriteBrandData);
    }
  };

  // Get user's current location and update periodically
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          console.log('[BrandDetailsScreen] Location permission denied');
          setHasLocationPermission(false);
          return;
        }

        setHasLocationPermission(true);

        // Get current position
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(userCoords);
        console.log('[BrandDetailsScreen] User location:', userCoords);
      } catch (error) {
        console.error('[BrandDetailsScreen] Error getting location:', error);
        setHasLocationPermission(false);
      }
    };

    getCurrentLocation();

    // Update location every 30 seconds to check if user is still at location
    const locationInterval = setInterval(() => {
      if (checkInStatus !== 'success') {
        // Only update location if user hasn't successfully checked in
        getCurrentLocation();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(locationInterval);
  }, [checkInStatus]);

  // Check if user can check in (location + time based)
  const canCheckIn = useMemo(() => {
    if (!eventLocation || !eventStartTime || !eventEndTime) {
      return false; // Missing required data
    }

    // Check if current time is within event timeframe
    const now = new Date();
    const isWithinTimeRange = now >= eventStartTime && now <= eventEndTime;
    
    if (!isWithinTimeRange) {
      console.log('[BrandDetailsScreen] Not within event time range');
      return false;
    }

    // Check if user is at the event location
    if (!userLocation || !hasLocationPermission) {
      console.log('[BrandDetailsScreen] User location not available');
      return false;
    }

    // Calculate distance between user and event location
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      eventLocation[1], // latitude is second element [longitude, latitude]
      eventLocation[0]  // longitude is first element
    );

    const isAtLocation = distance <= CHECK_IN_RADIUS_METERS;
    console.log('[BrandDetailsScreen] Distance to event:', distance, 'meters, can check in:', isAtLocation);
    
    return isAtLocation;
  }, [eventLocation, eventStartTime, eventEndTime, userLocation, hasLocationPermission]);

  // Show code input when user can check in
  useEffect(() => {
    // Don't change status if user has already successfully checked in
    if (checkInStatus === 'success') {
      return;
    }

    if (canCheckIn && checkInStatus === 'none') {
      setCheckInStatus('input');
    } else if (!canCheckIn && (checkInStatus === 'input' || checkInStatus === 'incorrect')) {
      // If user moves away or time passes, reset to none
      setCheckInStatus('none');
    }
  }, [canCheckIn, checkInStatus]);

  const handleCodeSubmit = (code: string) => {
    if (code.length === 6) {
      // Validate check-in code against the event's check-in code
      if (code === checkInCode) {
        setCheckInStatus('success');
        // TODO: Submit check-in to backend API to record the check-in
      } else {
        setHasSubmittedCode(true);
        setCheckInStatus('incorrect');
      }
    }
  };

  const handleLeaveReview = () => {
    // TODO: Implement review functionality
    console.log('Leave review pressed');
  };

  return {
    brand,
    isLoading,
    error,
    checkInStatus,
    brandLogoUrl,
    isFavorite,
    isAddedToCalendar,
    handleBack,
    handleShare,
    handleAddToCalendar,
    handleAddFavorite,
    handleCodeSubmit,
    handleLeaveReview,
  };
};

