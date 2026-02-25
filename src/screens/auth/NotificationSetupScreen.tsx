import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNotificationsScreen } from '@/screens/tabs/profile/notifications/useNotificationsScreen';
import { NotificationItem } from '@/screens/tabs/profile/notifications/components';
import styles from '@/screens/tabs/profile/notifications/styles';
import SampleFinderIcon from '@/icons/SampleFinderIcon';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type NotificationSetupNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NotificationSetup'>;

const NotificationSetupScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NotificationSetupNavigationProp>();

  const {
    enablePushNotifications,
    notifications,
    previousNotifications,
    handlePushNotificationsChange,
    handleNotificationPress,
  } = useNotificationsScreen();

  const handleContinue = () => {
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('@/assets/main-header-bg.png')}
        style={[styles.headerBackground, { paddingTop: insets.top + 10 }]}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <TouchableOpacity onPress={handleContinue} style={styles.iconButton}>
              <Text style={{ fontSize: 16, fontFamily: 'Quicksand_600SemiBold', color: '#FFFFFF' }}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rightSection}>
            <SampleFinderIcon width={160} color="#FFFFFF" />
          </View>
        </View>
      </ImageBackground>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconTitleContainer}>
          <Image
            source={require('@/assets/bell.png')}
            style={{ width: 70, height: 70 }}
            resizeMode="contain"
          />
          <Text style={styles.notificationsTitle}>NOTIFICATIONS</Text>
        </View>

        <View style={styles.pushNotificationsSection}>
          <Text style={styles.pushNotificationsLabel}>Push Notifications</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.toggleButtonLeft,
                enablePushNotifications && styles.toggleButtonActive,
              ]}
              onPress={() => handlePushNotificationsChange(true)}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  enablePushNotifications && styles.toggleButtonTextActive,
                ]}
              >
                On
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.toggleButtonRight,
                !enablePushNotifications && styles.toggleButtonActive,
              ]}
              onPress={() => handlePushNotificationsChange(false)}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  !enablePushNotifications && styles.toggleButtonTextActive,
                ]}
              >
                Off
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {notifications.length === 0 && previousNotifications.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No notifications yet</Text>
            <Text style={styles.emptyStateSubtext}>
              You'll see updates about your check-ins, reviews, and favorite brands here
            </Text>
          </View>
        ) : (
          <>
            {notifications.length > 0 && (
              <View style={styles.notificationsListContainer}>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onPress={handleNotificationPress}
                  />
                ))}
              </View>
            )}
            {previousNotifications.length > 0 && (
              <>
                <Text style={styles.previouslySeenTitle}>Previously Seen</Text>
                <View style={styles.notificationsListContainer}>
                  {previousNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onPress={handleNotificationPress}
                    />
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default NotificationSetupScreen;
