import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ImageBackground,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const NotificationsScreen = () => {
  const navigation = useNavigation();

  // Location settings
  const [enableLocationAccess, setEnableLocationAccess] = useState(true);
  const [shareLocationWithBrands, setShareLocationWithBrands] = useState(false);

  // Notification settings
  const [enablePushNotifications, setEnablePushNotifications] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'eventReminders',
      label: 'Event Reminders',
      description: 'Get notified before events you favorited start.',
      enabled: true,
    },
    {
      id: 'checkInConfirmations',
      label: 'Check-in Confirmations',
      description: 'Confirmation when you successfully check in.',
      enabled: true,
    },
    {
      id: 'triviaGames',
      label: 'Trivia & Games',
      description: 'Daily trivia and game opportunities.',
      enabled: true,
    },
    {
      id: 'rewardsUpdates',
      label: 'Rewards Updates',
      description: 'Tier progression and reward milestones.',
      enabled: true,
    },
    {
      id: 'newEventsNearby',
      label: 'New Events Nearby',
      description: 'When new events are added near you.',
      enabled: true,
    },
    {
      id: 'favoriteBrandUpdates',
      label: 'Favorite Brand Updates',
      description: 'News from your favorite brands.',
      enabled: false,
    },
  ]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNotificationToggle = (id: string) => {
    setNotificationSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
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
        {/* Location Section */}
        <View style={[styles.section, styles.firstSection]}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Monicon name="mdi:map-marker" size={24} color={Colors.black} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.sectionDescription}>Required for event discovery</Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Enable Location Access</Text>
            </View>
            <Switch
              value={enableLocationAccess}
              onValueChange={setEnableLocationAccess}
              trackColor={{ false: '#E0E0E0', true: Colors.blueColorMode }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Share location with brands</Text>
            </View>
            <Switch
              value={shareLocationWithBrands}
              onValueChange={setShareLocationWithBrands}
              trackColor={{ false: '#E0E0E0', true: Colors.blueColorMode }}
              thumbColor={Colors.white}
            />
          </View>

          <Text style={styles.settingDescription}>
            Allow brands to see your approximate location during events.
          </Text>
          <View style={styles.settingDescriptionSpacer} />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Monicon name="mdi:bell" size={24} color={Colors.black} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <Text style={styles.sectionDescription}>Manage your notification preferences</Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Enable Push Notifications</Text>
            </View>
            <Switch
              value={enablePushNotifications}
              onValueChange={setEnablePushNotifications}
              trackColor={{ false: '#E0E0E0', true: Colors.blueColorMode }}
              thumbColor={Colors.white}
            />
          </View>

          <Text style={styles.subHeading}>Choose which notifications you'd like to receive:</Text>
          <View style={styles.subHeadingSpacer} />

          {notificationSettings.map((setting) => (
            <View key={setting.id} style={styles.notificationSettingRow}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{setting.label}</Text>
                <Text style={styles.notificationDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => handleNotificationToggle(setting.id)}
                trackColor={{ false: '#E0E0E0', true: Colors.blueColorMode }}
                thumbColor={Colors.white}
              />
            </View>
          ))}
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
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  firstSection: {
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  notificationSettingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.black,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
    lineHeight: 20,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
    marginTop: 4,
    marginBottom: 8,
    paddingLeft: 0,
  },
  settingDescriptionSpacer: {
    height: 8,
  },
  subHeading: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#666666',
    marginTop: 8,
  },
  subHeadingSpacer: {
    height: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
    marginHorizontal: 20,
  },
});

export default NotificationsScreen;

