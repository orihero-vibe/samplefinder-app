import { useState, useCallback, useRef } from 'react';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { Alert } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { logout, getCurrentUser } from '@/lib/auth';
import { getUserProfile, getUserStatistics, calculateTierStatus, UserProfileRow } from '@/lib/database';
import { formatDateForDisplay } from '@/utils/formatters';

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
  }, []);

  // Load profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
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

  // Format date of birth for display
  const formattedDOB = profile?.dob ? formatDateForDisplay(profile.dob) : '';
  
  // Get referral code from profile or use default
  const referralCode = profile?.referalCode || 'N/A';

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

