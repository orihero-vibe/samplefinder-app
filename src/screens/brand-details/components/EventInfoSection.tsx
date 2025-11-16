import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface EventInfoSectionProps {
  eventInfo: string;
}

const EventInfoSection: React.FC<EventInfoSectionProps> = ({ eventInfo }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>EVENT INFO:</Text>
      <Text style={styles.eventInfoText}>{eventInfo}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginBottom: 12,
  },
  eventInfoText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.blueColorMode,
    lineHeight: 20,
  },
});

export default EventInfoSection;

