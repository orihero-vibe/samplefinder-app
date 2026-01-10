import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PointsBadgeIcon } from '@/icons';

interface PointsBadgeProps {
  points: number;
  size?: number;
}

const PointsBadge: React.FC<PointsBadgeProps> = ({ points, size = 140 }) => {
  return (
    <View style={[styles.container, { width: size + 60, height: size + 40 }]}>
      <PointsBadgeIcon size={size} points={points} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});

export default PointsBadge;
