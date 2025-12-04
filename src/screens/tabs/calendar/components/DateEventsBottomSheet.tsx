import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/Colors';
import { CalendarEventDetail } from './SelectedDateEvents';
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

  const handleEventPress = (event: CalendarEventDetail) => {
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
          filteredEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              onPress={() => handleEventPress(event)}
              activeOpacity={0.7}
              style={styles.eventItem}
            >
              <View style={styles.eventLeft}>
                <View
                  style={[
                    styles.logoContainer,
                    event.logo?.backgroundColor && {
                      backgroundColor: event.logo.backgroundColor,
                    },
                    event.logo?.backgroundColor === Colors.white
                      ? {
                          borderWidth: 1,
                          borderColor: Colors.brandBlueBright,
                        }
                      : {
                          borderWidth: 0,
                        },
                  ]}
                >
                  {event.logo?.text && (
                    <Text
                      style={[
                        styles.logoText,
                        event.logo.backgroundColor === Colors.white && styles.logoTextWhite,
                      ]}
                    >
                      {event.logo.text}
                    </Text>
                  )}
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={styles.locationText}>{event.location}</Text>
                  <Text style={styles.distanceText}>{event.distance}</Text>
                </View>
              </View>
              <View style={styles.eventRight}>
                <Text style={styles.timeText}>{event.time}</Text>
              </View>
            </TouchableOpacity>
          ))
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
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  eventLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.orangeBA,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 8,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 10,
  },
  logoTextWhite: {
    color: Colors.brandBlueBright,
    fontSize: 9,
    fontFamily: 'Quicksand_400Regular',
    textTransform: 'lowercase',
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandBlueBright,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.brandBlueBright,
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.brandBlueBright,
  },
  eventRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  timeText: {
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.brandBlueBright,
  },
});

export default DateEventsBottomSheet;

