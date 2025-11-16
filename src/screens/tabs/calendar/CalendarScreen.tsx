import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BottomSheet from '@gorhom/bottom-sheet';
import {
  CalendarHeader,
  ViewToggle,
  CalendarGrid,
  EventList,
  DiscoverButton,
  DateEventsBottomSheet,
  CalendarEvent,
  CalendarEventDetail,
} from './components';
import { Colors } from '@/constants/Colors';

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Sample events data for calendar grid (simple dates)
  const calendarEvents: CalendarEvent[] = [
    { id: '1', date: new Date(2026, 0, 5) },
    { id: '2', date: new Date(2026, 0, 8) },
    { id: '3', date: new Date(2026, 0, 10) },
    { id: '4', date: new Date(2026, 0, 21) },
    { id: '5', date: new Date(2026, 0, 30) },
    { id: '6', date: new Date(2026, 1, 5) },
    { id: '7', date: new Date(2026, 1, 15) },
    { id: '8', date: new Date(2026, 2, 10) },
  ];

  // Detailed events data matching the screenshot
  const detailedEvents: CalendarEventDetail[] = [
    {
      id: '1',
      date: new Date(2026, 0, 5),
      name: 'AshaPops',
      location: 'Whole Foods Market',
      distance: '0.2 mi away',
      time: '3 - 6 pm',
      logo: {
        backgroundColor: Colors.orangeBA,
        text: 'ASHA\nPOPS',
      },
    },
    {
      id: '2',
      date: new Date(2026, 0, 8),
      name: 'Amor Cura',
      location: 'Brooklyn Fare',
      distance: '5 mi away',
      time: '12:30 - 4:30 pm',
      logo: {
        backgroundColor: Colors.white,
        text: 'amor\ncura',
      },
    },
    {
      id: '3',
      date: new Date(2026, 0, 10),
      name: 'AshaPops',
      location: 'Whole Foods Market',
      distance: '0.2 mi away',
      time: '3 - 6 pm',
      logo: {
        backgroundColor: Colors.orangeBA,
        text: 'ASHA\nPOPS',
      },
    },
    {
      id: '4',
      date: new Date(2026, 0, 10),
      name: 'Amor Cura',
      location: 'Brooklyn Fare',
      distance: '5 mi away',
      time: '12:30 - 4:30 pm',
      logo: {
        backgroundColor: Colors.white,
        text: 'amor\ncura',
      },
    },
    {
      id: '5',
      date: new Date(2026, 0, 21),
      name: 'Brand Event',
      location: 'Local Store',
      distance: '1.5 mi away',
      time: '10 - 2 pm',
      logo: {
        backgroundColor: Colors.orangeBA,
        text: 'BRAND',
      },
    },
    {
      id: '6',
      date: new Date(2026, 0, 30),
      name: 'Sample Event',
      location: 'Market Place',
      distance: '2.3 mi away',
      time: '11 - 3 pm',
      logo: {
        backgroundColor: Colors.white,
        text: 'SAMPLE',
      },
    },
  ];

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Open bottom sheet
    bottomSheetRef.current?.expand();
  };

  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handleDiscoverPress = () => {
    // Navigate to discover events screen
    console.log('Discover new events pressed');
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CalendarHeader
        month={monthName}
        year={year}
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
          <ViewToggle selectedView={viewType} onViewChange={setViewType} />

          {viewType === 'calendar' ? (
            <CalendarGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              events={calendarEvents}
              onDateSelect={handleDateSelect}
            />
          ) : (
            <EventList events={calendarEvents} selectedDate={selectedDate} />
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
        events={detailedEvents}
        selectedDate={selectedDate}
        onClose={handleCloseBottomSheet}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for fixed button
  },
  spacer: {
    height: 20,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

export default CalendarScreen;
