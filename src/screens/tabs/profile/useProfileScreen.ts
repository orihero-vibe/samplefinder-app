import { useState, useCallback, useRef, type RefObject } from 'react';
import { View } from 'react-native';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { Alert, Linking, Share } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { logout, getCurrentUser } from '@/lib/auth';
import { captureAndShareView } from '@/utils/captureAndShare';
import { getUserProfile, calculateTierStatus, fetchTiers, getUserCurrentTier, UserProfileRow, getUserCheckInsCount, getUserReviewsCount, getUnreadNotificationCount } from '@/lib/database';
import { formatDateForDisplay } from '@/utils/formatters';
import { countAchievedBadges } from '@/constants';
import { getReferralShareConfig, type ReferralShareConfig } from '@/lib/referralSettings';

interface UseProfileScreenOptions {
  contentRef?: RefObject<View | null>;
}

export const useProfileScreen = (options: UseProfileScreenOptions = {}) => {
  const { contentRef } = options;
  const navigation = useNavigation();
  const referFriendBottomSheetRef = useRef<BottomSheet>(null);
  const referFriendSuccessBottomSheetRef = useRef<BottomSheet>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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
  const [tierStatus, setTierStatus] = useState<string>('NewbieSampler');
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [referralShare, setReferralShare] = useState<ReferralShareConfig | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const user = await getCurrentUser();
      if (!user) {
        setError('Not authenticated. Please log in again.');
        setHasUnreadNotifications(false);
        setIsLoading(false);
        return;
      }

      setAuthUser({ email: user.email, name: user.name });

      const userProfile = await getUserProfile(user.$id);
      setProfile(userProfile);

      if (userProfile?.referralCode && userProfile.referralCode !== 'N/A') {
        try {
          const cfg = await getReferralShareConfig(userProfile.referralCode);
          setReferralShare(cfg);
        } catch {
          setReferralShare(null);
        }
      } else {
        setReferralShare(null);
      }

        // Use actual counts from database instead of cached profile fields
        // This ensures consistency with the Achievements screen
        if (userProfile) {
          // Fetch actual counts from database in parallel. Use user.$id (authID) for unread count - notifications API looks up profile by authID.
          const [eventCheckIns, samplingReviews, unreadCount] = await Promise.all([
            getUserCheckInsCount(userProfile.$id),
            getUserReviewsCount(userProfile.$id),
            getUnreadNotificationCount(user.$id),
          ]);
          setHasUnreadNotifications(unreadCount > 0);
        
        // Calculate badge achievements based on thresholds (includes influencer and ambassador badges)
        const eventBadges = countAchievedBadges(eventCheckIns);
        const reviewBadges = countAchievedBadges(samplingReviews);
        const ambassadorBadge = userProfile.isAmbassador ? 1 : 0;
        const influencerBadge = userProfile.isInfluencer ? 1 : 0;
        const totalBadges = eventBadges + reviewBadges + ambassadorBadge + influencerBadge;
        
        const totalPoints = userProfile.totalPoints ?? 0;
        setStatistics({
          totalPoints,
          eventCheckIns,
          samplingReviews,
          badgeAchievements: totalBadges,
        });

        // Prefer stored tierLevel from profile as the canonical tier,
        // falling back to points-based calculation for legacy profiles.
        if (userProfile.tierLevel && userProfile.tierLevel.trim().length > 0) {
          setTierStatus(userProfile.tierLevel);
        } else {
          try {
            const tiers = await fetchTiers();
            const currentTier = getUserCurrentTier(tiers, totalPoints);
            setTierStatus(currentTier?.name ?? 'NewbieSampler');
          } catch (tierErr) {
            setTierStatus(calculateTierStatus(totalPoints));
          }
        }
      } else {
        setTierStatus('NewbieSampler');
        setHasUnreadNotifications(false);
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load profile when screen is focused; unread count is set once when loadProfile completes to avoid icon flashing
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
      const message = `Check out my SampleFinder profile! I'm ${username} with ${statistics.totalPoints} points and ${tierStatus} tier status. I've checked into ${statistics.eventCheckIns} events and left ${statistics.samplingReviews} reviews. Join me in discovering amazing samples!`;
      if (contentRef?.current) {
        await captureAndShareView(contentRef, message);
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const handleReferFriendPress = async () => {
    try {
      const username = profile?.username || authUser?.name || 'User';
      const code = profile?.referralCode;
      let cfg = referralShare;
      if (code && code !== 'N/A' && !cfg) {
        try {
          cfg = await getReferralShareConfig(code);
        } catch {
          cfg = null;
        }
      }
      const shareUrl = cfg?.shareUrl ?? 'https://simplefinder.com';
      const refPts = cfg?.referrerPoints ?? 100;
      const refePts = cfg?.refereePoints ?? 100;
      const message =
        code && code !== 'N/A'
          ? `Join me on SampleFinder, ${username}! Sign up with my link and we both earn points — you get ${refePts} and I get ${refPts} when you activate your account.\n\n${shareUrl}\n\nDownload the app and discover amazing samples near you. 🎁`
          : `Join me on SampleFinder and discover amazing samples near you! Download the app and start earning rewards today! 🎁`;

      await Share.share({ message });
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

  const handleLogOutPress = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
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
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      Alert.alert(
        'Logout Failed',
        error.message || 'Failed to log out. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
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
    tierStatus,
    hasUnreadNotifications,
    isLoading,
    error,
    isLoggingOut,
    showLogoutModal,
    formattedDOB,
    referralCode,
    referralShare,
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
    handleConfirmLogout,
    handleCancelLogout,
    handleEditProfilePress,
    handleViewRewardsPress,
    handleNotificationsPress,
    handleApplyHerePress,
  };
};

