import React, { useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Text } from 'react-native';
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import BottomSheet from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/Colors';
import BackShareHeader from '@/components/wrappers/BackShareHeader';
import ReferFriendBottomSheet from '@/components/shared/ReferFriendBottomSheet';
import ReferFriendSuccessBottomSheet from '@/components/shared/ReferFriendSuccessBottomSheet';
import { logout, getCurrentUser } from '@/lib/auth';
import { getUserProfile, getUserStatistics, calculateTierStatus, UserProfileRow } from '@/lib/database';
import { formatDateForDisplay } from '@/utils/formatters';
import {
  TopLinks,
  ProfileOverview,
  PointsDisplay,
  ActivityMetrics,
  RewardsProgressButton,
  PersonalInfoSection,
  NotificationsButton,
  BrandAmbassadorSection,
} from './components';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const referFriendBottomSheetRef = useRef<BottomSheet>(null);
  const referFriendSuccessBottomSheetRef = useRef<BottomSheet>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [authUser, setAuthUser] = useState<{ email: string; name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [statistics, setStatistics] = useState({
    totalPoints: 0,
    eventCheckIns: 0,
    samplingReviews: 0,
    badgeAchievements: 0,
  });

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get current authenticated user
      const user = await getCurrentUser();
      if (!user) {
        setError('Not authenticated. Please log in again.');
        setIsLoading(false);
        return;
      }

      setAuthUser({ email: user.email, name: user.name });

      // Fetch user profile from database
      const userProfile = await getUserProfile(user.$id);
      setProfile(userProfile);
      
      // Fetch user statistics
      const userStats = await getUserStatistics(user.$id);
      setStatistics(userStats);
      
      console.log('[ProfileScreen] Profile loaded:', {
        hasProfile: !!userProfile,
        username: userProfile?.username,
        email: user.email,
        statistics: userStats,
      });
    } catch (err: any) {
      console.error('[ProfileScreen] Error loading profile:', err);
      setError(err?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const handleBackPress = () => {
    // Handle back navigation
    console.log('Back pressed');
  };

  const handleSharePress = () => {
    // Handle share action
    console.log('Share pressed');
  };

  const handleReferFriendPress = () => {
    referFriendBottomSheetRef.current?.snapToIndex(0);
  };

  const handleReferFriendClose = () => {
    referFriendBottomSheetRef.current?.close();
  };

  const handleReferSuccess = () => {
    referFriendSuccessBottomSheetRef.current?.snapToIndex(0);
  };

  const handleReferSuccessClose = () => {
    referFriendSuccessBottomSheetRef.current?.close();
  };

  const handleViewRewardsFromSuccess = () => {
    referFriendSuccessBottomSheetRef.current?.close();
    navigation.navigate('Promotions' as never);
  };

  const handleLogOutPress = async () => {
    // Show confirmation alert
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
              // Navigate to Login screen and reset navigation stack
              // Get root navigator by traversing up the navigation tree
              const rootNavigation = navigation.getParent()?.getParent() || navigation.getParent() || navigation;
              rootNavigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              );
            } catch (error: any) {
              console.error('Logout error:', error);
              Alert.alert(
                'Logout Failed',
                error.message || 'Failed to log out. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfilePress = () => {
    navigation.navigate('EditProfile' as never);
  };

  const handleViewRewardsPress = () => {
    navigation.navigate('Promotions' as never);
  };

  const handleNotificationsPress = () => {
    navigation.navigate('Notifications' as never);
  };

  const handleApplyHerePress = () => {
    // Handle brand ambassador application
    console.log('Apply here pressed');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <BackShareHeader onBack={handleBackPress} onShare={handleSharePress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brandPurpleDeep} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <BackShareHeader onBack={handleBackPress} onShare={handleSharePress} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  // Format date of birth for display
  const formattedDOB = profile?.dob ? formatDateForDisplay(profile.dob) : '';
  
  // Get referral code from profile or use default
  const referralCode = profile?.referalCode || 'N/A';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <BackShareHeader onBack={handleBackPress} onShare={handleSharePress} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TopLinks
          onReferFriendPress={handleReferFriendPress}
          onLogOutPress={handleLogOutPress}
        />
        <ProfileOverview
          username={profile?.username || authUser?.name || 'User'}
          onEditProfilePress={handleEditProfilePress}
        />
        <PointsDisplay points={statistics.totalPoints} />
        <ActivityMetrics
          data={{
            eventCheckIns: statistics.eventCheckIns,
            samplingReviews: statistics.samplingReviews,
            badgeAchievements: statistics.badgeAchievements,
          }}
        />
        <RewardsProgressButton onPress={handleViewRewardsPress} />
        <PersonalInfoSection
          data={{
            tierStatus: calculateTierStatus(statistics.totalPoints),
            dateOfBirth: formattedDOB,
            phoneNumber: profile?.phoneNumber || '',
            email: authUser?.email || '',
          }}
        />
        <NotificationsButton onPress={handleNotificationsPress} />
        <BrandAmbassadorSection onApplyPress={handleApplyHerePress} />
      </ScrollView>

      {/* Refer Friend Bottom Sheet */}
      <ReferFriendBottomSheet
        bottomSheetRef={referFriendBottomSheetRef}
        referralCode={referralCode}
        onClose={handleReferFriendClose}
        onReferSuccess={handleReferSuccess}
      />

      {/* Refer Friend Success Bottom Sheet */}
      <ReferFriendSuccessBottomSheet
        bottomSheetRef={referFriendSuccessBottomSheetRef}
        points={100}
        onClose={handleReferSuccessClose}
        onViewRewards={handleViewRewardsFromSuccess}
      />
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
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.brandPurpleDeep,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: '#FF6B6B',
    textAlign: 'center',
  },
});

export default ProfileScreen;

