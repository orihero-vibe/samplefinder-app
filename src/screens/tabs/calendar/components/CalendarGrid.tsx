import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useCalendarEventsStore } from '@/stores/calendarEventsStore';

interface CalendarEvent {
  id: string;
  date: Date | string;
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
  const { isSavedToCalendar } = useCalendarEventsStore();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Normalize date to compare only year, month, and day (ignore time)
  const normalizeDate = (date: Date | string): Date => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  // Get events for this month
  const monthEvents = events.filter((event) => {
    const eventDate = normalizeDate(event.date);
    return (
      eventDate.getFullYear() === year && eventDate.getMonth() === month
    );
  });

  const hasEvent = (day: number): boolean => {
    return monthEvents.some((event) => {
      const eventDate = normalizeDate(event.date);
      const isOnDay = eventDate.getDate() === day;
      const isSaved = isSavedToCalendar(event.id);
      return isOnDay && isSaved;
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
    today.setHours(0, 0, 0, 0);
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date < today && !isToday(day);
  };

  const handleDatePress = (day: number) => {
    if (isPastDate(day)) {
      return;
    }
    const date = new Date(year, month, day);
    onDateSelect(date);
  };

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Generate calendar days grouped into weeks
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Group days into weeks (7 days per week)
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  // Pad the last week if needed
  const lastWeek = weeks[weeks.length - 1];
  while (lastWeek && lastWeek.length < 7) {
    lastWeek.push(null);
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

      {/* Calendar grid with week rows */}
      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`}>
            <View style={styles.weekRow}>
              {week.map((day, dayIndex) => {
                if (day === null) {
                  return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.dayCell} />;
                }

                const selected = isSelected(day);
                const hasEventDot = hasEvent(day);
                const pastDate = isPastDate(day);
                const today = isToday(day);

                return (
                  <TouchableOpacity
                    key={day}
                    style={styles.dayCell}
                    onPress={() => handleDatePress(day)}
                    activeOpacity={pastDate ? 1 : 0.7}
                    disabled={pastDate}
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
                        {day}
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
            {/* Separator line after each week row */}
            <View style={styles.weekSeparator} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
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
    color: Colors.blueColorMode,
  },
  grid: {
    // Grid now contains week rows
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekSeparator: {
    height: 1,
    backgroundColor: '#E7E7E7',
    marginHorizontal: 10,
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dateContainer: {
    width: 36,
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  selectedDateContainer: {
    backgroundColor: Colors.blueColorMode,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.blueColorMode,
  },
  selectedDateText: {
    color: Colors.white,
  },
  todayDateContainer: {
    backgroundColor: Colors.blueColorMode,
  },
  todayDateText: {
    color: Colors.white,
  },
  pastDateText: {
    color: '#CCCCCC',
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
    backgroundColor: Colors.white,
  },
  pastEventDot: {
    backgroundColor: Colors.gray,
  },
});

export default CalendarGrid;

