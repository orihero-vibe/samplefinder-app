import { useState, useCallback, useRef } from 'react';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { Alert, Linking, Share } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { logout, getCurrentUser } from '@/lib/auth';
import { getUserProfile, calculateTierStatus, UserProfileRow } from '@/lib/database';
import { formatDateForDisplay } from '@/utils/formatters';
import { countAchievedBadges } from '@/constants';

export const useProfileScreen = () => {
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

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const user = await getCurrentUser();
      if (!user) {
        setError('Not authenticated. Please log in again.');
        setIsLoading(false);
        return;
      }

      setAuthUser({ email: user.email, name: user.name });

      const userProfile = await getUserProfile(user.$id);
      setProfile(userProfile);
      
      // Use statistics directly from profile fields
      if (userProfile) {
        const eventCheckIns = userProfile.totalEvents ?? 0;
        const samplingReviews = userProfile.totalReviews ?? 0;
        
        // Calculate badge achievements based on thresholds
        const eventBadges = countAchievedBadges(eventCheckIns);
        const reviewBadges = countAchievedBadges(samplingReviews);
        const totalBadges = eventBadges + reviewBadges;
        
        setStatistics({
          totalPoints: userProfile.totalPoints ?? 0,
          eventCheckIns,
          samplingReviews,
          badgeAchievements: totalBadges,
        });
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleBackPress = () => {
    // Navigate back to Home tab
    navigation.goBack();
  };

  const handleSharePress = async () => {
    try {
      const username = profile?.username || authUser?.name || 'User';
      const tierStatus = calculateTierStatus(statistics.totalPoints);
      
      await Share.share({
        message: `Check out my SampleFinder profile! I'm ${username} with ${statistics.totalPoints} points and ${tierStatus} tier status. I've checked into ${statistics.eventCheckIns} events and left ${statistics.samplingReviews} reviews. Join me in discovering amazing samples!`,
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const handleReferFriendPress = async () => {
    try {
      const username = profile?.username || authUser?.name || 'User';
      const message = referralCode && referralCode !== 'N/A'
        ? `Join me on SampleFinder! Use my referral code ${referralCode} when signing up and we both get 100 points! Download the app and discover amazing samples near you. 🎁`
        : `Join me on SampleFinder and discover amazing samples near you! Download the app and start earning rewards today! 🎁`;
      
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing referral:', error);
    }
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

  const handleApplyHerePress = async () => {
    const url = 'https://app.popbookings.com/vip/polarisbrandpromotions';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Unable to Open Link',
          'Unable to open the application form. Please check your internet connection.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error opening brand ambassador form:', error);
      Alert.alert(
        'Error',
        'Failed to open the application form. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const formattedDOB = profile?.dob ? formatDateForDisplay(profile.dob) : '';
  const referralCode = profile?.referralCode || 'N/A';

  return {
    profile,
    authUser,
    statistics,
    isLoading,
    error,
    isLoggingOut,
    formattedDOB,
    referralCode,
    referFriendBottomSheetRef,
    referFriendSuccessBottomSheetRef,
    handleBackPress,
    handleSharePress,
    handleReferFriendPress,
    handleReferFriendClose,
    handleReferSuccess,
    handleReferSuccessClose,
    handleViewRewardsFromSuccess,
    handleLogOutPress,
    handleEditProfilePress,
    handleViewRewardsPress,
    handleNotificationsPress,
    handleApplyHerePress,
  };
};

