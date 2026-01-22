import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface PointsDisplayProps {
  points?: number;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ points = 4500 }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
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
    fontSize: 50,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandPurpleBright,
  },
  pointsLabel: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.pinBlueBlack,
  },
});

export default PointsDisplay;

