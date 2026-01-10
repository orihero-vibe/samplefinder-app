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
import { fetchAllEvents, fetchClients, EventRow, ClientData } from '@/lib/database';
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
          fetchAllEvents(),
          fetchClients(),
        ]);

        const simpleEvents: CalendarEvent[] = eventRows.map((event) => ({
          id: event.$id,
          date: new Date(event.date),
        }));

        const detailed: CalendarEventDetail[] = eventRows.map((event) => {
          let client = extractClientFromEvent(event);
          
          if (!client || !client.location) {
            const clientId = typeof event.client === 'string' ? event.client : event.client?.$id;
            if (clientId) {
              const fullClient = allClients.find((c) => c.$id === clientId);
              if (fullClient) {
                client = fullClient;
              }
            }
          }
          
          return convertEventToCalendarEventDetail(event, client, userLocation || undefined);
        });

        detailed.sort((a, b) => a.date.getTime() - b.date.getTime());

        setCalendarEvents(simpleEvents);
        setDetailedEvents(detailed);
      } catch (err: any) {
        console.error('Error loading events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [userLocation]);

  const handlePreviousMonth = () => {
    if (viewType === 'list') {
      const displayDate = selectedDate || currentDate;
      const newDate = new Date(displayDate);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      setCurrentDate(newDate);
      setSelectedDate(null);
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNextMonth = () => {
    if (viewType === 'list') {
      const displayDate = selectedDate || currentDate;
      const newDate = new Date(displayDate);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      setCurrentDate(newDate);
      setSelectedDate(null);
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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

  const selectedDateEvents = detailedEvents.filter((event) => {
    if (!selectedDate) return false;
    const eventDate = new Date(event.date);
    return (
      eventDate.getFullYear() === selectedDate.getFullYear() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getDate() === selectedDate.getDate()
    );
  });

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

  const monthName = useMemo(() => monthNames[currentDate.getMonth()], [currentDate]);
  const year = useMemo(() => currentDate.getFullYear(), [currentDate]);
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

