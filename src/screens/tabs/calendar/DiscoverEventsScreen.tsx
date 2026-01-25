import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useDiscoverEventsScreen } from './discover-events/useDiscoverEventsScreen';
import { EventCard, UnifiedEvent } from '@/components';
import styles from './discover-events/styles';

const DiscoverEventsScreen = () => {
  const insets = useSafeAreaInsets();
  
  const {
    calendarEvents,
    isLoading,
    isRefreshing,
    error,
    handleEventPress,
    handleRetry,
    handleRefresh,
    handleGoBack,
  } = useDiscoverEventsScreen();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.brandPurpleDeep, Colors.brandBlueDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <View style={styles.contentWrapper}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brandBlueBright} />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : calendarEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No upcoming events found</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.brandBlueBright}
                colors={[Colors.brandBlueBright]}
              />
            }
          >
            {calendarEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event.id)}
                showDate={true}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default DiscoverEventsScreen;
