import React from 'react';
import { View, ScrollView, Platform, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  CalendarHeader,
  ViewToggle,
  CalendarGrid,
  EventList,
  DiscoverButton,
  DateEventsBottomSheet,
} from './components';
import { Colors } from '@/constants/Colors';
import { useCalendarScreen } from './useCalendarScreen';
import styles from './styles';

const CalendarScreen = () => {
  const {
    currentDate,
    selectedDate,
    viewType,
    calendarEvents,
    detailedEvents,
    isLoading,
    error,
    selectedDateEvents,
    monthName,
    year,
    displayDateFormatted,
    bottomSheetRef,
    scrollViewRef,
    handlePreviousMonth,
    handleNextMonth,
    handleDateSelect,
    handleCloseBottomSheet,
    handleViewToggle,
    handleDiscoverPress,
  } = useCalendarScreen();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={Colors.brandBlueBright} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <StatusBar style="light" />
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubtext}>Please try again later</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {viewType === 'list' ? (
        <CalendarHeader
          month={displayDateFormatted}
          year={null}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />
      ) : (
        <CalendarHeader
          month={monthName}
          year={year}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />
      )}

      <View style={styles.contentWrapper}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ViewToggle selectedView={viewType} onViewChange={handleViewToggle} />

          {viewType === 'calendar' ? (
            <CalendarGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              events={calendarEvents}
              onDateSelect={handleDateSelect}
            />
          ) : (
            <EventList events={detailedEvents} selectedDate={selectedDate || currentDate} />
          )}

          {/* Spacer for fixed button */}
          <View style={styles.spacer} />
        </ScrollView>

        {/* Fixed Discover Button */}
        <View style={styles.fixedButtonContainer}>
          <DiscoverButton onPress={handleDiscoverPress} />
        </View>
      </View>

      {/* Bottom Sheet for Events */}
      <DateEventsBottomSheet
        bottomSheetRef={bottomSheetRef}
        events={selectedDateEvents}
        selectedDate={selectedDate}
        onClose={handleCloseBottomSheet}
      />
    </View>
  );
};

export default CalendarScreen;
