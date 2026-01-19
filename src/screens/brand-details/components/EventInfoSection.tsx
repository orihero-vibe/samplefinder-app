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
    marginBottom: 28,
    alignItems: 'flex-start',
    width: '100%',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginRight: 16,
    width: 90,
    textAlign: 'left',
    paddingTop: 4,
  },
  eventInfoText: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Quicksand_500Medium',
    color: '#050A24',
    lineHeight: 24,
  },
});

export default EventInfoSection;

