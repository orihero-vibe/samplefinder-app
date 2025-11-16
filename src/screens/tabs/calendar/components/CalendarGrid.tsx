import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';

interface CalendarEvent {
  id: string;
  date: Date;
}

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  selectedDate,
  events,
  onDateSelect,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Get events for this month
  const monthEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getFullYear() === year && eventDate.getMonth() === month
    );
  });

  const hasEvent = (day: number): boolean => {
    return monthEvents.some((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day;
    });
  };

  const isSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isPastDate = (day: number): boolean => {
    const today = new Date();
    const date = new Date(year, month, day);
    return date < today && !isToday(day);
  };

  const handleDatePress = (day: number) => {
    const date = new Date(year, month, day);
    onDateSelect(date);
  };

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <View style={styles.container}>
      {/* Days of week header */}
      <View style={styles.daysOfWeekContainer}>
        {daysOfWeek.map((day) => (
          <View key={day} style={styles.dayOfWeek}>
            <Text style={styles.dayOfWeekText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const selected = isSelected(day);
          const hasEventDot = hasEvent(day);
          const pastDate = isPastDate(day);

          return (
            <TouchableOpacity
              key={day}
              style={styles.dayCell}
              onPress={() => handleDatePress(day)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dateContainer,
                  selected && styles.selectedDateContainer,
                ]}
              >
                <Text
                  style={[
                    styles.dateText,
                    selected && styles.selectedDateText,
                    pastDate && !selected && styles.pastDateText,
                  ]}
                >
                  {day}
                </Text>
                {hasEventDot && (
                  <View
                    style={[
                      styles.eventDot,
                      selected && styles.selectedEventDot,
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeek: {
    flex: 1,
    alignItems: 'center',
  },
  dayOfWeekText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandPurpleDeep,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dateContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  selectedDateContainer: {
    backgroundColor: Colors.brandBlueBright,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandPurpleDeep,
  },
  selectedDateText: {
    color: Colors.white,
  },
  pastDateText: {
    color: '#CCCCCC',
  },
  eventDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.brandPurpleDeep,
  },
  selectedEventDot: {
    backgroundColor: Colors.white,
  },
});

export default CalendarGrid;

