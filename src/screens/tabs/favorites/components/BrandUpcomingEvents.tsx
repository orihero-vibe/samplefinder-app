import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';

// Standardized EventData interface matching other screens
export interface EventData {
  id: string;
  name: string;
  location: string;
  distance: string;
  date: Date | string; // Can be Date object or formatted string
  time: string;
  logoURL?: string | null;
  brandName?: string;
  // Legacy support: market field for backward compatibility
  market?: string;
}

interface BrandUpcomingEventsProps {
  events: EventData[];
  onEventPress?: (eventId: string) => void;
}

const BrandUpcomingEvents: React.FC<BrandUpcomingEventsProps> = ({ events, onEventPress }) => {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UPCOMING EVENTS:</Text>
      <View style={styles.eventsContainer}>
        {events.map((event) => {
          // Format date without year: "Feb 10" instead of "Feb 10, 2026"
          let dateStr: string;
          if (typeof event.date === 'string') {
            // If it's already a string, try to parse and reformat without year
            try {
              const date = new Date(event.date);
              if (!isNaN(date.getTime())) {
                dateStr = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              } else {
                // If parsing fails, try to remove year from existing format
                dateStr = event.date.replace(/,\s*\d{4}$/, '');
              }
            } catch {
              dateStr = event.date.replace(/,\s*\d{4}$/, '');
            }
          } else {
            dateStr = event.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
          }
          const locationName = event.location || 'Location TBD';
          const cityState = event.distance || ''; // Using distance field for city, state
          
          const eventContent = (
            <Text style={styles.eventText}>
              {dateStr}  <Text style={styles.separator}>|</Text>  {locationName}
              {cityState ? (
                <>
                  {'  '}<Text style={styles.separator}>|</Text>{'  '}{cityState}
                </>
              ) : null}
            </Text>
          );

          if (onEventPress) {
            return (
              <TouchableOpacity
                key={event.id}
                onPress={() => onEventPress(event.id)}
                activeOpacity={0.7}
                style={styles.eventTouchable}
              >
                <Text style={[styles.eventText, styles.eventTextClickable]}>
                  {dateStr}  <Text style={styles.separator}>|</Text>  {locationName}
                  {cityState ? (
                    <>
                      {'  '}<Text style={styles.separator}>|</Text>{'  '}{cityState}
                    </>
                  ) : null}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <View key={event.id}>
              {eventContent}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.black,
    marginBottom: 8,
  },
  eventsContainer: {
    gap: 4,
  },
  eventTouchable: {
    paddingVertical: 2,
  },
  eventText: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.pinBlueBlack,
    lineHeight: 20,
  },
  eventTextClickable: {
    color: Colors.pinBlueBlack,
  },
  separator: {
    color: '#E7E7E7',
  },
});

export default BrandUpcomingEvents;

