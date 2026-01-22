import React from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BottomSheet from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/Colors';
import BackShareHeader from '@/components/wrappers/BackShareHeader';
import ReferFriendBottomSheet from '@/components/shared/ReferFriendBottomSheet';
import ReferFriendSuccessBottomSheet from '@/components/shared/ReferFriendSuccessBottomSheet';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import { calculateTierStatus } from '@/lib/database';
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
import { useProfileScreen } from './useProfileScreen';
import styles from './styles';

const ProfileScreen = () => {
  const {
    profile,
    authUser,
    statistics,
    isLoading,
    error,
    isLoggingOut,
    showLogoutModal,
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
    handleConfirmLogout,
    handleCancelLogout,
    handleEditProfilePress,
    handleViewRewardsPress,
    handleNotificationsPress,
    handleApplyHerePress,
  } = useProfileScreen();

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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <BackShareHeader onBack={handleBackPress} onShare={handleSharePress} onNotifications={handleNotificationsPress} />

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
          avatarUri={profile?.avatarURL || null}
          onEditProfilePress={handleEditProfilePress}
          isAmbassador={profile?.isAmbassador || false}
          isInfluencer={profile?.isInfluencer || false}
          eventCheckIns={statistics.eventCheckIns}
          samplingReviews={statistics.samplingReviews}
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
        <BrandAmbassadorSection 
          onApplyHerePress={handleApplyHerePress}
          isAmbassador={profile?.isAmbassador || false}
        />
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

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        title="Are you sure you want to logout?"
        description="You will need to sign in again to access your account."
        confirmText="Yes, Logout"
        cancelText="No, Stay Logged In"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        isLoading={isLoggingOut}
        loadingText="Logging out..."
      />
    </View>
  );
};

export default ProfileScreen;
