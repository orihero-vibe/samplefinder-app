import React from 'react';
import { View, ScrollView, Platform, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  CalendarHeader,
  ViewToggle,
  CalendarGrid,
  WeekView,
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
    handleBackToCalendar,
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

  // Determine header text based on view mode
  const getHeaderText = () => {
    if (viewType === 'list') {
      if (selectedDate) {
        // Day View - show specific date
        return displayDateFormatted;
      }
      // List View - show "Upcoming Events"
      return 'Upcoming Events';
    }
    // Calendar View - show month and year
    return monthName;
  };

  const getHeaderYear = () => {
    if (viewType === 'list' && !selectedDate) {
      // List View - no year needed
      return null;
    }
    if (viewType === 'list' && selectedDate) {
      // Day View - no separate year (included in date string)
      return null;
    }
    // Calendar View - show year
    return year;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CalendarHeader
        month={getHeaderText()}
        year={getHeaderYear()}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />

      <View style={styles.contentWrapper}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ViewToggle selectedView={viewType} onViewChange={handleViewToggle} />

          {viewType === 'calendar' ? (
            selectedDate ? (
              // Week View - when a date is selected in calendar mode
              <WeekView
                selectedDate={selectedDate}
                events={detailedEvents}
                onBackToCalendar={handleBackToCalendar}
              />
            ) : (
              // Calendar Grid - monthly view
              <CalendarGrid
                currentDate={currentDate}
                selectedDate={selectedDate}
                events={calendarEvents}
                onDateSelect={handleDateSelect}
              />
            )
          ) : (
            // List View - shows upcoming events or day-specific events
            <EventList 
              events={detailedEvents} 
              selectedDate={selectedDate}
              showUpcoming={!selectedDate}
            />
          )}

          {/* Spacer for fixed button */}
          <View style={styles.spacer} />
        </ScrollView>

        {/* Fixed Discover Button - only show in calendar grid and list views */}
        {(viewType === 'list' || !selectedDate) && (
          <View style={styles.fixedButtonContainer}>
            <DiscoverButton onPress={handleDiscoverPress} />
          </View>
        )}
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
