import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/Colors';
import { EventCard, UnifiedEvent } from '@/components';
import { CalendarEventDetail } from './SelectedDateEvents';
import { TabParamList } from '@/navigation/TabNavigator';
import { CalendarStackParamList } from '@/navigation/CalendarStack';
import DiscoverButton from './DiscoverButton';
import { useCalendarScreen } from '../useCalendarScreen';
import { useCalendarEventsStore } from '@/stores/calendarEventsStore';

type WeekViewNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CalendarStackParamList, 'CalendarMain'>,
  BottomTabNavigationProp<TabParamList, 'Calendar'>
>;

interface WeekViewProps {
  selectedDate: Date;
  events: CalendarEventDetail[];
  onBackToCalendar: () => void;
}

const WeekView: React.FC<WeekViewProps> = ({ selectedDate, events, onBackToCalendar }) => {
  const navigation = useNavigation<WeekViewNavigationProp>();
  const { handleDiscoverPress } = useCalendarScreen();
  const { isSavedToCalendar } = useCalendarEventsStore();
  
  // Local state to track selected date within week view
  const [localSelectedDate, setLocalSelectedDate] = React.useState(selectedDate);

  // Get the week containing the selected date
  const getWeekDates = (date: Date): Date[] => {
    const week: Date[] = [];
    const current = new Date(date);
    
    // Get to Sunday of the week
    const day = current.getDay();
    current.setDate(current.getDate() - day);
    
    // Generate 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return week;
  };

  const weekDates = getWeekDates(selectedDate);
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Filter events for the selected date
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === localSelectedDate.getDate() &&
      eventDate.getMonth() === localSelectedDate.getMonth() &&
      eventDate.getFullYear() === localSelectedDate.getFullYear()
    );
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const isSelected = (date: Date): boolean => {
    return (
      date.getDate() === localSelectedDate.getDate() &&
      date.getMonth() === localSelectedDate.getMonth() &&
      date.getFullYear() === localSelectedDate.getFullYear()
    );
  };
  
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };
  
  const handleDatePress = (date: Date) => {
    setLocalSelectedDate(date);
  };

  const hasEvent = (date: Date): boolean => {
    return events.some((event) => {
      const eventDate = new Date(event.date);
      const isOnDate = (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
      const isSaved = isSavedToCalendar(event.id);
      return isOnDate && isSaved;
    });
  };

  const handleEventPress = (event: UnifiedEvent) => {
    navigation.navigate('BrandDetails', { eventId: event.id });
  };

  return (
    <View style={styles.container}>
      {/* Week Days and Dates */}
      <View style={styles.weekContainer}>
        <View style={styles.daysRow}>
          {daysOfWeek.map((day, index) => (
            <View key={day} style={styles.dayColumn}>
              <Text style={styles.dayText}>{day}</Text>
            </View>
          ))}
        </View>
        <View style={styles.datesRow}>
          {weekDates.map((date, index) => {
            const selected = isSelected(date);
            const hasEventDot = hasEvent(date);
            const pastDate = isPastDate(date);
            const today = isToday(date);
            
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.dateColumn}
                onPress={() => handleDatePress(date)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.dateContainer,
                    today && !selected && styles.todayDateContainer,
                    selected && styles.selectedDateContainer,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      today && !selected && styles.todayDateText,
                      selected && styles.selectedDateText,
                      pastDate && !selected && !today && styles.pastDateText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  {hasEventDot && (
                    <View
                      style={[
                        styles.eventDot,
                        selected && styles.selectedEventDot,
                        today && !selected && styles.todayEventDot,
                        pastDate && !selected && !today && styles.pastEventDot,
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Separator Line */}
      <View style={styles.separator} />

      {/* Events List */}
      <ScrollView 
        style={styles.eventsContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsContent}
      >
        {filteredEvents.length > 0 ? (
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
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events on this day</Text>
          </View>
        )}
        
        {/* Back to Calendar Button */}

        <TouchableOpacity 
          style={[styles.backButton, styles.discoverButton]}
          onPress={handleDiscoverPress}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Discover New Events!</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBackToCalendar}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Back To Full Calendar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  weekContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.white,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  daysRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandBlueBright,
  },
  datesRow: {
    flexDirection: 'row',
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateContainer: {
    width: 40,
    height: 56,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop:4,
  },
  selectedDateContainer: {
    backgroundColor: Colors.blueColorMode,
  },
  todayDateContainer: {
    // backgroundColor: Colors.blueColorMode,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.blueColorMode,
  },
  selectedDateText: {
    color: Colors.white,
  },
  todayDateText: {
    // color: Colors.white,
  },
  pastDateText: {
    color: Colors.gray,
  },
  eventDot: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.blueColorMode,
    marginBottom:10,
  },
  selectedEventDot: {
    backgroundColor: Colors.white,
  },
  todayEventDot: {
    // backgroundColor: Colors.white,
  },
  pastEventDot: {
    backgroundColor: Colors.gray,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventsContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
  },
  discoverButton: {
    marginTop: 50,
  },
  backButton: {
    backgroundColor: Colors.blueColorMode,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.white,
  },

});

export default WeekView;
