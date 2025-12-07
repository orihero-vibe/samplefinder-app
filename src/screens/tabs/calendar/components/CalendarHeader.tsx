import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

interface CalendarHeaderProps {
  month: string;
  year: number | null;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  month,
  year,
  onPreviousMonth,
  onNextMonth,
}) => {
  return (
    <LinearGradient
      colors={[Colors.brandPurpleDeep, Colors.brandBlueDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <TouchableOpacity onPress={onPreviousMonth} style={styles.iconButton}>
          <Monicon name="mdi:chevron-left" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.monthYear}>{year !== null ? `${month} ${year}` : month}</Text>
        <TouchableOpacity onPress={onNextMonth} style={styles.iconButton}>
          <Monicon name="mdi:chevron-right" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 30 : 60,
    paddingBottom: 15,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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

