import { Colors } from '@/constants/Colors';
import { HomeStackParamList } from '@/navigation/HomeStack';
import { TabParamList } from '@/navigation/TabNavigator';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { ScrollView, Share, StyleSheet, View, Alert, Linking } from 'react-native';
import * as Calendar from 'expo-calendar';
import { parseEventDateTime } from '@/utils/formatters';
import {
  ActionButtons,
  BrandInfo,
  BrandLocationPin,
  DiscountMessage,
  EventInfoSection,
  ProductsSection,
  CheckInCodeInput,
  CheckInSuccess,
} from './components';
import BackShareHeader from '@/components/wrappers/BackShareHeader';

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

interface BrandDetailsScreenProps {
  route: {
    params: {
      brand: BrandDetailsData;
    };
  };
}

type CheckInStatus = 'none' | 'input' | 'incorrect' | 'success';

const BrandDetailsScreen: React.FC<BrandDetailsScreenProps> = ({ route }) => {
  const navigation = useNavigation<BrandDetailsScreenNavigationProp>();
  const { brand } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddedToCalendar, setIsAddedToCalendar] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>('none');
  const [hasSubmittedCode, setHasSubmittedCode] = useState(false);

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
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
    console.log('Add favorite pressed', !isFavorite);
  };

  // Show code input after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCodeInput(true);
      setCheckInStatus('input');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleCodeSubmit = (code: string) => {
    if (code.length === 6) {
      // Mock: First submission always shows incorrect
      if (!hasSubmittedCode) {
        setHasSubmittedCode(true);
        setCheckInStatus('incorrect');
      } else {
        // After re-submission, show success
        setCheckInStatus('success');
      }
    }
  };

  const handleLeaveReview = () => {
    // TODO: Implement review functionality
    console.log('Leave review pressed');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <BackShareHeader onBack={handleBack} onShare={handleShare} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BrandLocationPin />
        <BrandInfo brand={brand} />
        <ProductsSection products={brand.products} />
        <EventInfoSection eventInfo={brand.eventInfo} />
        <DiscountMessage />
        
        {showCodeInput && checkInStatus !== 'success' && (
          <CheckInCodeInput
            onCodeSubmit={handleCodeSubmit}
            showError={checkInStatus === 'incorrect'}
          />
        )}

        {checkInStatus === 'success' && (
          <CheckInSuccess onLeaveReview={handleLeaveReview} />
        )}

        <ActionButtons
          onAddToCalendar={handleAddToCalendar}
          onAddFavorite={handleAddFavorite}
          isFavorite={isFavorite}
          isAddedToCalendar={isAddedToCalendar}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

export default BrandDetailsScreen;

