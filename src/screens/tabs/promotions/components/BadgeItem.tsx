import { Colors } from '@/constants/Colors';
import { Monicon } from '@monicon/native';
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

const BadgeItem: React.FC<BadgeItemProps> = ({ badge, size = 60, color = Colors.badgePurpleLight }) => {
  return (
    <View style={[styles.container, { opacity: badge.achieved ? 1 : 0.3 }]}>
      <View style={[styles.badgeCircle, { borderColor: color }]}>
        {badge.count && <Text style={[styles.countText, { color }]}>{badge.count}</Text>}
      </View>
      <Text style={[styles.label, { color }]}>{badge.label}</Text>
      <View style={styles.badgeIconContainer}>
        <Monicon strokeWidth={2} name="streamline:star-2-remix" size={size * 0.3} color={color} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 50,
  },
  badgeCircle: {
    width:50,
    height: 50,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 2,
  },
  countText: {
    fontSize: 20,
    fontFamily: 'Quicksand_600SemiBold',
    textAlign: 'center',
  },
  label: {
    fontSize: 10,
    fontFamily: 'Quicksand_600SemiBold',
    textAlign: 'center',
  },
  badgeIconContainer: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: 0,
    bottom: 0,
    zIndex: 1,
    padding: 2,
    width: 18,
    height: 18,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
});

export default BadgeItem;

