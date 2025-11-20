import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/Colors';
import BackShareHeader from '@/components/wrappers/BackShareHeader';
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

  const handleBackPress = () => {
    // Handle back navigation
    console.log('Back pressed');
  };

  const handleSharePress = () => {
    // Handle share action
    console.log('Share pressed');
  };

  const handleReferFriendPress = () => {
    // Handle refer friend action
    console.log('Refer friend pressed');
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
    // Handle notifications
    console.log('Notifications pressed');
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

