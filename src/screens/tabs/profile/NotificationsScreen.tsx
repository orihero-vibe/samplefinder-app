import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Monicon } from '@monicon/native';
import { useNotificationsScreen } from './notifications/useNotificationsScreen';
import { NotificationItem } from './notifications/components';
import { BellNotificationIcon } from '@/icons/BellNotificationIcon';
import styles from './notifications/styles';
import SampleFinderIcon from '@/icons/SampleFinderIcon';

const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  
  const {
    enablePushNotifications,
    notifications,
    previousNotifications,
    handleBackPress,
    handlePushNotificationsChange,
    handleNotificationPress,
  } = useNotificationsScreen();

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
            <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
              <Monicon name="mdi:arrow-left" size={24} color="#FFFFFF" />
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
        {/* Bell Icon and Title */}
        <View style={styles.iconTitleContainer}>
          <BellNotificationIcon size={70} />
          <Text style={styles.notificationsTitle}>NOTIFICATIONS</Text>
        </View>

        {/* Push Notifications Toggle */}
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

        {/* Notification Items */}
        {notifications.length === 0 && previousNotifications.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No notifications yet</Text>
            <Text style={styles.emptyStateSubtext}>
              You'll see updates about your check-ins, reviews, and favorite brands here
            </Text>
          </View>
        ) : (
          <>
            {/* Current Notifications (Unread) */}
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

            {/* Previously Seen Section (Read) */}
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

export default NotificationsScreen;
