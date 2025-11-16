import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';

type ViewType = 'calendar' | 'list';

interface ViewToggleProps {
  selectedView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ selectedView, onViewChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.segment,
          styles.leftSegment,
          selectedView === 'calendar' && styles.selectedSegment,
        ]}
        onPress={() => onViewChange('calendar')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.segmentText,
            selectedView === 'calendar' && styles.selectedText,
          ]}
        >
          Calendar
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.segment,
          styles.rightSegment,
          selectedView === 'list' && styles.selectedSegment,
        ]}
        onPress={() => onViewChange('list')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.segmentText,
            selectedView === 'list' && styles.selectedText,
          ]}
        >
          List
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.brandBlueBright,
    overflow: 'hidden',
    maxWidth: 250,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftSegment: {
    borderRightWidth: 1,
    borderRightColor: Colors.brandBlueBright,
  },
  rightSegment: {},
  selectedSegment: {
    backgroundColor: Colors.brandBlueBright,
  },
  segmentText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandBlueBright,
  },
  selectedText: {
    color: Colors.white,
  },
});

export default ViewToggle;

