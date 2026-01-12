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
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginRight: 16,
    width: 80,
    textAlign: 'left',
  },
  eventInfoText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    lineHeight: 20,
  },
});

export default EventInfoSection;

