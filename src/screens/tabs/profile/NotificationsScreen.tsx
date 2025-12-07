import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Monicon } from '@monicon/native';
import { useNotificationsScreen } from './notifications/useNotificationsScreen';
import { LocationSection, NotificationSection } from './notifications/components';
import styles from './notifications/styles';

const NotificationsScreen = () => {
  const {
    enableLocationAccess,
    shareLocationWithBrands,
    enablePushNotifications,
    notificationSettings,
    setEnableLocationAccess,
    setShareLocationWithBrands,
    setEnablePushNotifications,
    handleBackPress,
    handleNotificationToggle,
  } = useNotificationsScreen();

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
        <LocationSection
          enableLocationAccess={enableLocationAccess}
          shareLocationWithBrands={shareLocationWithBrands}
          onLocationAccessChange={setEnableLocationAccess}
          onShareLocationChange={setShareLocationWithBrands}
        />

        <View style={styles.divider} />

        <NotificationSection
          enablePushNotifications={enablePushNotifications}
          notificationSettings={notificationSettings}
          onPushNotificationsChange={setEnablePushNotifications}
          onNotificationToggle={handleNotificationToggle}
        />
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;
