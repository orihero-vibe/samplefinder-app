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
import { 
  fetchEventById, 
  fetchClients, 
  EventRow, 
  ClientData,
  createCheckIn,
  getUserCheckInForEvent,
  createReview,
  getUserReviewForEvent,
  getUserProfile,
} from '@/lib/database';
import { convertEventToBrandDetails, extractClientFromEvent } from '@/utils/brandUtils';
import { HomeStackParamList } from '@/navigation/HomeStack';
import { TabParamList } from '@/navigation/TabNavigator';
import { getCurrentUser } from '@/lib/auth';

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
  const [eventData, setEventData] = useState<EventRow | null>(null); // Store full event data for points
  const [isLoading, setIsLoading] = useState(!!eventId);
  const [error, setError] = useState<string | null>(null);
  const [checkInCode, setCheckInCode] = useState<string>('');
  
  // State for event location and timing data (for check-in validation)
  const [eventLocation, setEventLocation] = useState<[number, number] | null>(null); // [longitude, latitude]
  const [eventStartTime, setEventStartTime] = useState<Date | null>(null);
  const [eventEndTime, setEventEndTime] = useState<Date | null>(null);
  const [eventRadius, setEventRadius] = useState<number>(100); // Default 100 meters if not specified
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
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false); // Prevent duplicate submissions
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [pointsModalVisible, setPointsModalVisible] = useState(false);
  const [pointsModalTitle, setPointsModalTitle] = useState('Nice Work!');
  const [pointsModalAmount, setPointsModalAmount] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checkInPoints, setCheckInPoints] = useState(0);
  const [reviewPoints, setReviewPoints] = useState(0);
  
  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const event = await fetchEventById(eventId);
        if (!event) {
          setError('Event not found');
          setIsLoading(false);
          return;
        }
        
        let client = extractClientFromEvent(event);
        
        if (!client && event.client) {
          const clientId = typeof event.client === 'string' ? event.client : event.client.$id;
          if (clientId) {
            const allClients = await fetchClients();
            client = allClients.find((c) => c.$id === clientId) || null;
          }
        }
        
        if (client?.location) {
          setEventLocation(client.location);
        }
        
        if (event.startTime) {
          setEventStartTime(new Date(event.startTime));
        }
        if (event.endTime) {
          setEventEndTime(new Date(event.endTime));
        }
        
        if (event.radius && event.radius > 0) {
          setEventRadius(event.radius);
        } else {
          setEventRadius(100);
        }
        
        const logoUrl = client?.logoURL || null;
        setBrandLogoUrl(logoUrl);
        
        setEventData(event);
        const brandData = convertEventToBrandDetails(event, client);
        setBrand(brandData);
        setCheckInCode(event.checkInCode || '');
        
        const authUser = await getCurrentUser();
        if (authUser) {
          const userProfile = await getUserProfile(authUser.$id);
          if (userProfile) {
            const existingCheckIn = await getUserCheckInForEvent(userProfile.$id, eventId);
            if (existingCheckIn) {
              setCheckInStatus('success');
              setCheckInPoints(existingCheckIn.pointsEarned || event.checkInPoints || 0);
            }
            
            // Check for existing review
            const existingReview = await getUserReviewForEvent(userProfile.$id, eventId);
            if (existingReview) {
              setHasReviewed(true);
              setReviewPoints(existingReview.pointsEarned || event.reviewPoints || 0);
            }
          }
        }
      } catch (err: any) {
        console.error('Error loading event:', err);
        setError(err.message || 'Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    loadEventData();
  }, [eventId]);
  
  const isFavorite = useMemo(() => {
    if (!brand) return false;
    return favorites.some((f) => f.id === brand.id);
  }, [favorites, brand]);
  
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
    const tabMap: Record<string, keyof TabParamList> = {
      home: 'Home',
      profile: 'Profile',
      favorites: 'Favorites',
      calendar: 'Calendar',
      promotions: 'Promotions',
    };
    const tabName = tabMap[tab];
    if (tabName) {
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
    if (isAddedToCalendar) {
      setIsAddedToCalendar(false);
      return;
    }

    try {
      const { status: currentStatus } = await Calendar.getCalendarPermissionsAsync();

      let finalStatus = currentStatus;

      if (currentStatus === 'undetermined') {
        const { status: requestedStatus } = await Calendar.requestCalendarPermissionsAsync();
        finalStatus = requestedStatus;
      }

      if (finalStatus !== 'granted') {
        if (finalStatus === 'denied') {
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
          Alert.alert(
            'Permission Needed',
            'Please grant calendar access to add events to your calendar.',
            [{ text: 'OK' }]
          );
        }
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      if (calendars.length === 0) {
        Alert.alert(
          'No Calendars',
          'No calendars are available on your device.',
          [{ text: 'OK' }]
        );
        return;
      }

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

      const addressString = `${brand.address.street}, ${brand.address.city}, ${brand.address.state} ${brand.address.zip}`;

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

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setHasLocationPermission(false);
          return;
        }

        setHasLocationPermission(true);

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(userCoords);
      } catch (error) {
        console.error('Error getting location:', error);
        setHasLocationPermission(false);
      }
    };

    getCurrentLocation();

    const locationInterval = setInterval(() => {
      if (checkInStatus !== 'success') {
        getCurrentLocation();
      }
    }, 30000);

    return () => clearInterval(locationInterval);
  }, [checkInStatus]);

  const canCheckIn = useMemo(() => {
    if (!eventLocation || !eventStartTime || !eventEndTime) {
      return false;
    }

    const now = new Date();
    const isWithinTimeRange = now >= eventStartTime && now <= eventEndTime;
    
    if (!isWithinTimeRange) {
      return false;
    }

    if (!userLocation || !hasLocationPermission) {
      return false;
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      eventLocation[0],
      eventLocation[1]
    );

    return distance <= eventRadius;
  }, [eventLocation, eventStartTime, eventEndTime, eventRadius, userLocation, hasLocationPermission]);

  useEffect(() => {
    if (checkInStatus === 'success') {
      return;
    }

    if (canCheckIn && checkInStatus === 'none') {
      setCheckInStatus('input');
    } else if (!canCheckIn && (checkInStatus === 'input' || checkInStatus === 'incorrect')) {
      setCheckInStatus('none');
    }
  }, [canCheckIn, checkInStatus]);

  const handleCodeSubmit = async (code: string) => {
    if (isSubmittingCheckIn) {
      return;
    }

    if (code.length === 6) {
      if (code === checkInCode) {
        try {
          setIsSubmittingCheckIn(true);
          
          const authUser = await getCurrentUser();
          if (!authUser) {
            Alert.alert('Error', 'You must be logged in to check in');
            setIsSubmittingCheckIn(false);
            return;
          }

          const { getUserProfile } = await import('@/lib/database');
          const userProfile = await getUserProfile(authUser.$id);
          if (!userProfile) {
            Alert.alert('Error', 'User profile not found');
            setIsSubmittingCheckIn(false);
            return;
          }

          const existingCheckIn = await getUserCheckInForEvent(userProfile.$id, eventId || '');
          if (existingCheckIn) {
            Alert.alert('Already Checked In', 'You have already checked in to this event');
            setCheckInStatus('success');
            setIsSubmittingCheckIn(false);
            return;
          }

          const checkInData = {
            userID: userProfile.$id,
            eventID: eventId || '',
            checkInCode: code,
            pointsEarned: eventData?.checkInPoints || 0,
          };

          await createCheckIn(checkInData);

          const earnedPoints = eventData?.checkInPoints || 0;
          setCheckInPoints(earnedPoints);
          setCheckInStatus('success');
          
          // Show points earned modal
          setPointsModalAmount(earnedPoints);
          setPointsModalTitle('Nice Work!');
          setPointsModalVisible(true);
        } catch (error: any) {
          console.error('Error during check-in:', error);
          Alert.alert('Error', error.message || 'Failed to complete check-in');
          setCheckInStatus('incorrect');
        } finally {
          setIsSubmittingCheckIn(false);
        }
      } else {
        setHasSubmittedCode(true);
        setCheckInStatus('incorrect');
      }
    }
  };

  const handleLeaveReview = () => {
    setReviewModalVisible(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalVisible(false);
  };

  const handleClosePointsModal = () => {
    setPointsModalVisible(false);
  };

  const handleSubmitReview = async (reviewText: string, rating: number) => {
    try {
      const authUser = await getCurrentUser();
      if (!authUser) {
        Alert.alert('Error', 'You must be logged in to leave a review');
        return;
      }

      const { getUserProfile } = await import('@/lib/database');
      const userProfile = await getUserProfile(authUser.$id);
      if (!userProfile) {
        Alert.alert('Error', 'User profile not found');
        return;
      }

      const existingReview = await getUserReviewForEvent(userProfile.$id, eventId || '');
      if (existingReview) {
        Alert.alert('Already Reviewed', 'You have already reviewed this event');
        return;
      }

      const reviewData = {
        user: userProfile.$id,
        event: eventId || '',
        review: reviewText || undefined,
        rating: rating,
        pointsEarned: eventData?.reviewPoints || 0,
      };

      await createReview(reviewData);

      setHasReviewed(true);
      
      // Show points earned modal for review
      const earnedPoints = eventData?.reviewPoints || 0;
      setReviewPoints(earnedPoints);
      setPointsModalAmount(earnedPoints);
      setPointsModalTitle('Review Submitted');
      setPointsModalVisible(true);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', error.message || 'Failed to submit review');
    }
  };

  const totalEarnedPoints = checkInPoints + reviewPoints;

  return {
    brand,
    isLoading,
    error,
    checkInStatus,
    brandLogoUrl,
    isFavorite,
    isAddedToCalendar,
    reviewModalVisible,
    isSubmittingCheckIn,
    pointsModalVisible,
    pointsModalTitle,
    pointsModalAmount,
    hasReviewed,
    checkInPoints,
    totalEarnedPoints,
    handleBack,
    handleShare,
    handleAddToCalendar,
    handleAddFavorite,
    handleCodeSubmit,
    handleLeaveReview,
    handleCloseReviewModal,
    handleSubmitReview,
    handleClosePointsModal,
  };
};

