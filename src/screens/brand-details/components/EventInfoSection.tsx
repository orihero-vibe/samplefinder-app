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
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'flex-start',
    width: '100%',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginRight: 12,
    minWidth: 100,
    flex: 1,
    textAlign: 'right',
  },
  eventInfoText: {
    flex: 10,
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    lineHeight: 20,
  },
});

export default EventInfoSection;

