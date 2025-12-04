import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/Colors';
import { TabParamList } from '@/navigation/TabNavigator';
import { CalendarStackParamList } from '@/navigation/CalendarStack';

type SelectedDateEventsNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CalendarStackParamList, 'CalendarMain'>,
  BottomTabNavigationProp<TabParamList, 'Calendar'>
>;

export interface CalendarEventDetail {
  id: string;
  date: Date;
  name: string;
  location: string;
  distance: string;
  time: string;
  logo?: {
    backgroundColor: string;
    text?: string;
    icon?: string;
  };
}

interface SelectedDateEventsProps {
  events: CalendarEventDetail[];
  selectedDate: Date | null;
}

const SelectedDateEvents: React.FC<SelectedDateEventsProps> = ({
  events,
  selectedDate,
}) => {
  const navigation = useNavigation<SelectedDateEventsNavigationProp>();

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

  if (filteredEvents.length === 0) {
    return null;
  }

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleEventPress = (event: CalendarEventDetail) => {
    // Navigate to BrandDetailsScreen with eventId - it will fetch data from database
    navigation.navigate('BrandDetails', { eventId: event.id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.separator} />
      {filteredEvents.map((event) => (
        <TouchableOpacity
          key={event.id}
          onPress={() => handleEventPress(event)}
          activeOpacity={0.7}
        >
          <View style={styles.eventItem}>
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
              <Text style={styles.dateText}>{formattedDate}</Text>
              <Text style={styles.timeText}>{event.time}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
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
  dateText: {
    fontSize: 13,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandBlueBright,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.brandBlueBright,
  },
});

export default SelectedDateEvents;

