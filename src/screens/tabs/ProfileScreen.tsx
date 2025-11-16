import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { LocationPinIcon, SparkleIcon } from '@/icons';
import CustomButton from '@/components/shared/CustomButton';

const ProfileScreen = () => {
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
    // Handle edit profile action
    console.log('Edit profile pressed');
  };

  const handleViewRewardsPress = () => {
    // Handle view rewards progress
    console.log('View rewards progress pressed');
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
      <ImageBackground
        source={require('@/assets/main-header-bg.png')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
              <Monicon name="mdi:arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSharePress} style={styles.iconButton}>
              <Monicon name="mdi:share-variant" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.rightSection}>
            <Monicon name="mdi:map-marker" size={20} color="#FFFFFF" />
            <Text style={styles.appTitle}>SampleFinder</Text>
          </View>
        </View>
      </ImageBackground>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Links */}
        <View style={styles.topLinks}>
          <TouchableOpacity
            onPress={handleReferFriendPress}
            style={styles.referFriendButton}
          >
            <Monicon name="mdi:account-multiple" size={24} color={Colors.brandPurpleDeep} />
            <Text style={styles.referFriendText}>Refer a Friend</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogOutPress} style={styles.logOutButton}>
            <Text style={styles.logOutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Overview */}
        <View style={styles.profileOverview}>
          <View style={styles.profilePictureContainer}>
            <LocationPinIcon size={100} color={Colors.brandPurpleDeep} />
          </View>
          <Text style={styles.username}>Username</Text>
          <TouchableOpacity onPress={handleEditProfilePress}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Points Earned */}
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsValue}>4500</Text>
          <Text style={styles.pointsLabel}>Points Earned</Text>
        </View>

        {/* Activity Metrics */}
        <View style={styles.activityMetrics}>
          <View style={styles.metricColumn}>
            <Text style={styles.metricValue}>150</Text>
            <Text style={styles.metricLabel}>Event Check Ins</Text>
          </View>
          <View style={styles.metricColumn}>
            <Text style={styles.metricValue}>15</Text>
            <Text style={styles.metricLabel}>Sampling Reviews</Text>
          </View>
          <View style={styles.metricColumn}>
            <Text style={styles.metricValue}>3</Text>
            <Text style={styles.metricLabel}>Badge Achievements</Text>
          </View>
        </View>

        {/* Rewards Progress */}
        <TouchableOpacity
          onPress={handleViewRewardsPress}
          style={styles.rewardsProgressButton}
        >
          <SparkleIcon size={24} color={Colors.brandPurpleDeep} circleColor={Colors.white} />
          <Text style={styles.rewardsProgressText}>View Rewards Progress</Text>
        </TouchableOpacity>

        {/* Personal Information */}
        <View style={styles.personalInfoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>TIER STATUS:</Text>
            <Text style={styles.infoValue}>NewbieSampler</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DATE OF BIRTH:</Text>
            <Text style={styles.infoValue}>April 3, 1979</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PHONE NUMBER:</Text>
            <Text style={styles.infoValue}>(215) 555-1212</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>EMAIL:</Text>
            <Text style={styles.infoValue}>thesamplefinder@gmail.com</Text>
          </View>
        </View>

        {/* Notifications */}
        <TouchableOpacity
          onPress={handleNotificationsPress}
          style={styles.notificationsButton}
        >
          <Monicon name="mdi:bell" size={24} color={Colors.brandPurpleDeep} />
          <Text style={styles.notificationsText}>Notifications</Text>
          <Monicon name="mdi:chevron-right" size={24} color={Colors.brandPurpleDeep} />
        </TouchableOpacity>

        {/* Brand Ambassador Section */}
        <View style={styles.brandAmbassadorSection}>
          <Text style={styles.brandAmbassadorText}>
            Want to join our brand ambassador team and represent your favorite brands in stores?
            Earn your Certified Brand Ambassador badge!
          </Text>
          <CustomButton
            title="Apply Here!"
            onPress={handleApplyHerePress}
            variant="primary"
            size="medium"
            style={styles.applyButton}
            textStyle={styles.applyButtonText}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerBackground: {
    paddingTop: Platform.OS === 'android' ? 30 : 60,
    paddingBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  topLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  referFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  referFriendText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandPurpleDeep,
  },
  logOutButton: {
    padding: 5,
  },
  logOutText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.black,
  },
  profileOverview: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profilePictureContainer: {
    marginBottom: 16,
  },
  username: {
    fontSize: 32,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandPurpleDeep,
    marginBottom: 8,
  },
  editProfileText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.brandPurpleBright,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsValue: {
    fontSize: 48,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandPurpleBright,
    marginBottom: 4,
  },
  pointsLabel: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.brandPurpleBright,
  },
  activityMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  metricColumn: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 32,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandPurpleBright,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    textAlign: 'center',
  },
  rewardsProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  rewardsProgressText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandPurpleDeep,
  },
  personalInfoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandPurpleDeep,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    flex: 1,
  },
  notificationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  notificationsText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandPurpleDeep,
  },
  brandAmbassadorSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  brandAmbassadorText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    marginBottom: 16,
    lineHeight: 20,
  },
  applyButton: {
    backgroundColor: Colors.orangeBA,
  },
  applyButtonText: {
    color: Colors.white,
  },
});

export default ProfileScreen;

