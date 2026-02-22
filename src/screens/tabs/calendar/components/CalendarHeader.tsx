import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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

  return (
    <LinearGradient
      colors={[Colors.brandPurpleDeep, Colors.brandBlueDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, { paddingTop: insets.top + 10 }]}
    >
      <View style={[styles.content, !showNavigation && styles.contentCentered]}>
        {showNavigation ? (
          <>
            <TouchableOpacity onPress={onPreviousMonth} style={styles.iconButton}>
              <Monicon name="mdi:chevron-left" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.monthYear}>{year !== null ? `${month} ${year}` : month}</Text>
            <TouchableOpacity onPress={onNextMonth} style={styles.iconButton}>
              <Monicon name="mdi:chevron-right" size={24} color={Colors.white} />
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.monthYear}>{year !== null ? `${month} ${year}` : month}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentCentered: {
    justifyContent: 'center',
  },
  iconButton: {
    padding: 5,
  },
  monthYear: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
  },
});

export default CalendarHeader;

