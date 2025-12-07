import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/Colors';
import { CalendarEventDetail } from './SelectedDateEvents';
import { EventCard, UnifiedEvent } from '@/components';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '@/navigation/TabNavigator';
import { CalendarStackParamList } from '@/navigation/CalendarStack';

type DateEventsNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CalendarStackParamList, 'CalendarMain'>,
  BottomTabNavigationProp<TabParamList, 'Calendar'>
>;

interface DateEventsBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  events: CalendarEventDetail[];
  selectedDate: Date | null;
  onClose: () => void;
}

const DateEventsBottomSheet: React.FC<DateEventsBottomSheetProps> = ({
  bottomSheetRef,
  events,
  selectedDate,
  onClose,
}) => {
  const navigation = useNavigation<DateEventsNavigationProp>();

  if (!selectedDate) {
    return null;
  }

  // Filter events for selected date
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleEventPress = (event: UnifiedEvent) => {
    // Navigate to BrandDetailsScreen with eventId - it will fetch data from database
    navigation.navigate('BrandDetails', { eventId: event.id });
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['50%', '90%']}
      enablePanDownToClose={true}
      onClose={onClose}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events for {formattedDate}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events scheduled for this date</Text>
          </View>
        ) : (
          filteredEvents.map((event) => {
            const unifiedEvent: UnifiedEvent = {
              id: event.id,
              name: event.name,
              brandName: event.brandName,
              location: event.location,
              distance: event.distance,
              time: event.time,
              date: event.date,
              logoURL: event.logoURL,
            };
            return (
              <EventCard
                key={event.id}
                event={unifiedEvent}
                onPress={handleEventPress}
                showDate={true}
              />
            );
          })
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.white,
  },
  handleIndicator: {
    backgroundColor: '#D0D0D0',
    width: 40,
    height: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandBlueBright,
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.brandBlueBright,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
  },
});

export default DateEventsBottomSheet;

