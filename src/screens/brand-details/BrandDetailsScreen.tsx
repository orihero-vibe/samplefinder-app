import { Colors } from '@/constants/Colors';
import { HomeStackParamList } from '@/navigation/HomeStack';
import { TabParamList } from '@/navigation/TabNavigator';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
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

  const handleAddToCalendar = () => {
    setIsAddedToCalendar(!isAddedToCalendar);
    // TODO: Implement calendar integration
    console.log('Add to calendar pressed', !isAddedToCalendar);
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

