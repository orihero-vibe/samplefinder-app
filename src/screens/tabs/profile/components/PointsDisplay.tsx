import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface PointsDisplayProps {
  points?: number;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ points = 4500 }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.pointsValue}>{points}</Text>
      <Text style={styles.pointsLabel}>Points Earned</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsValue: {
    fontSize: 56,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.brandPurpleBright,
  },
  pointsLabel: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.pinBlueBlack,
  },
});

export default PointsDisplay;

