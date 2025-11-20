import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import BottomSheet from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/Colors';
import BackShareHeader from '@/components/wrappers/BackShareHeader';
import ReferFriendBottomSheet from '@/components/shared/ReferFriendBottomSheet';
import ReferFriendSuccessBottomSheet from '@/components/shared/ReferFriendSuccessBottomSheet';
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

  const handleLogOutPress = () => {
    // Handle log out action
    console.log('Log out pressed');
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
          username="Username"
          onEditProfilePress={handleEditProfilePress}
        />
        <PointsDisplay points={4500} />
        <ActivityMetrics
          eventCheckIns={150}
          samplingReviews={15}
          badgeAchievements={3}
        />
        <RewardsProgressButton onPress={handleViewRewardsPress} />
        <PersonalInfoSection
          tierStatus="NewbieSampler"
          dateOfBirth="April 3, 1979"
          phoneNumber="(215) 555-1212"
          email="thesamplefinder@gmail.com"
        />
        <NotificationsButton onPress={handleNotificationsPress} />
        <BrandAmbassadorSection onApplyPress={handleApplyHerePress} />
      </ScrollView>

      {/* Refer Friend Bottom Sheet */}
      <ReferFriendBottomSheet
        bottomSheetRef={referFriendBottomSheetRef}
        referralCode="JNKLOW"
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
});

export default ProfileScreen;

