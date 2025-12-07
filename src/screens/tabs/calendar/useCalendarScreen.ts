import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScrollView } from 'react-native';
import * as Location from 'expo-location';
import BottomSheet from '@gorhom/bottom-sheet';
import { TabParamList } from '@/navigation/TabNavigator';
import { CalendarStackParamList } from '@/navigation/CalendarStack';
import { fetchAllEvents, EventRow } from '@/lib/database';
import { convertEventToCalendarEventDetail, extractClientFromEvent } from '@/utils/brandUtils';
import { CalendarEvent, CalendarEventDetail } from './components';

type CalendarScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CalendarStackParamList, 'CalendarMain'>,
  BottomTabNavigationProp<TabParamList, 'Calendar'>
>;

export const useCalendarScreen = () => {
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [detailedEvents, setDetailedEvents] = useState<CalendarEventDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get user's current location for distance calculation
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('[CalendarScreen] Location permission denied');
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
        console.error('[CalendarScreen] Error getting location:', error);
      }
    };

    getCurrentLocation();
  }, []);

  // Fetch events from Appwrite
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all events from Appwrite
        const eventRows: EventRow[] = await fetchAllEvents();

        // Transform events for calendar grid (simple dates)
        const simpleEvents: CalendarEvent[] = eventRows.map((event) => ({
          id: event.$id,
          date: new Date(event.date),
        }));

        // Transform events for detailed view (with client data)
        const detailed: CalendarEventDetail[] = eventRows.map((event) => {
          const client = extractClientFromEvent(event);
          return convertEventToCalendarEventDetail(event, client, userLocation || undefined);
        });

        // Sort detailed events by date
        detailed.sort((a, b) => a.date.getTime() - b.date.getTime());

        setCalendarEvents(simpleEvents);
        setDetailedEvents(detailed);
      } catch (err: any) {
        console.error('[CalendarScreen] Error loading events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [userLocation]); // Reload when user location changes

  const handlePreviousMonth = () => {
    if (viewType === 'list') {
      // In list view, navigate to previous day
      const displayDate = selectedDate || currentDate;
      const newDate = new Date(displayDate);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    } else {
      // In calendar view, navigate to previous month
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      setCurrentDate(newDate);
      setSelectedDate(null);
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNextMonth = () => {
    if (viewType === 'list') {
      // In list view, navigate to next day
      const displayDate = selectedDate || currentDate;
      const newDate = new Date(displayDate);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    } else {
      // In calendar view, navigate to next month
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      setCurrentDate(newDate);
      setSelectedDate(null);
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Open bottom sheet
    bottomSheetRef.current?.expand();
  };

  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handleViewToggle = (newViewType: 'calendar' | 'list') => {
    setViewType(newViewType);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleDiscoverPress = () => {
    navigation.navigate('DiscoverEvents');
  };

  // Filter events for selected date
  const selectedDateEvents = detailedEvents.filter((event) => {
    if (!selectedDate) return false;
    const eventDate = new Date(event.date);
    return (
      eventDate.getFullYear() === selectedDate.getFullYear() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getDate() === selectedDate.getDate()
    );
  });

  // Month names array
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Derived values for calendar display
  const monthName = useMemo(() => monthNames[currentDate.getMonth()], [currentDate]);
  const year = useMemo(() => currentDate.getFullYear(), [currentDate]);
  
  // Get the date to display in list view header (selected date or current date)
  const displayDate = useMemo(() => selectedDate || currentDate, [selectedDate, currentDate]);
  const displayDateFormatted = useMemo(
    () => displayDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    [displayDate]
  );

  return {
    currentDate,
    selectedDate,
    viewType,
    calendarEvents,
    detailedEvents,
    isLoading,
    error,
    selectedDateEvents,
    monthName,
    year,
    displayDateFormatted,
    bottomSheetRef,
    scrollViewRef,
    handlePreviousMonth,
    handleNextMonth,
    handleDateSelect,
    handleCloseBottomSheet,
    handleViewToggle,
    handleDiscoverPress,
  };
};

