import { Colors } from '@/constants/Colors';
import { BadgeCircleIcon } from '@/icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface Badge {
  id: string;
  label: string;
  achieved: boolean;
  count?: number;
}

interface BadgeItemProps {
  badge: Badge;
  size?: number;
  color?: string;
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge, size = 50, color = Colors.badgePurpleLight }) => {
  return (
    <View style={[styles.container, { width: size }]}>
      <BadgeCircleIcon size={size} color={color} disabled={!badge.achieved} />
      {/* Count text overlay */}
      <View style={[styles.countContainer, { width: size, height: size }]}>
        {badge.count !== undefined && (
          <Text style={[styles.countText, { color, fontSize: size * 0.36, opacity: badge.achieved ? 1 : 0.3 }]}>#{badge.count}</Text>
        )}
      </View>
      <Text style={[styles.label, { color, opacity: badge.achieved ? 1 : 0.3 }]}>{badge.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  countContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  countText: {
    fontFamily: 'Quicksand_600SemiBold',
    textAlign: 'center',
  },
  label: {
    fontSize: 10,
    fontFamily: 'Quicksand_600SemiBold',
    textAlign: 'center',
    marginTop: -2,
  },
});

export default BadgeItem;

