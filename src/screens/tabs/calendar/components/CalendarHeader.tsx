import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

interface CalendarHeaderProps {
  month: string;
  year: number | null;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  /** When false, arrow buttons are hidden (e.g. Upcoming Events list view). Default true. */
  showNavigation?: boolean;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  month,
  year,
  onPreviousMonth,
  onNextMonth,
  showNavigation = true,
}) => {
  const insets = useSafeAreaInsets();

  const title = year !== null ? `${month} ${year}` : month;

  return (
    <LinearGradient
      colors={[Colors.brandPurpleDeep, Colors.brandBlueDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, { paddingTop: insets.top + 10 }]}
    >
      <View style={styles.content}>
        {showNavigation ? (
          <TouchableOpacity onPress={onPreviousMonth} style={styles.iconButton}>
            <Monicon name="mdi:arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.sideSlot} />
        )}
        <Text style={styles.monthYear} numberOfLines={2}>
          {title}
        </Text>
        {showNavigation ? (
          <TouchableOpacity onPress={onNextMonth} style={styles.iconButton}>
            <View style={styles.arrowRightMirror}>
              <Monicon name="mdi:arrow-left" size={24} color={Colors.white} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.sideSlot} />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 15,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    minHeight: 36,
  },
  sideSlot: {
    width: 40,
    height: 36,
  },
  iconButton: {
    width: 40,
    height: 36,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowRightMirror: {
    transform: [{ scaleX: -1 }],
  },
  monthYear: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
    textAlign: 'center',
  },
});

export default CalendarHeader;

