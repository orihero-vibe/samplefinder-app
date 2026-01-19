import { Colors } from '@/constants/Colors';
import {  EventsBadgeIcon, ReviewsBadgeIcon } from '@/icons';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface Badge {
  id: string;
  label?: string;
  achieved: boolean;
  count?: number;
}

interface BadgeItemProps {
  badge?: Badge;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  isEventsBadge?: boolean;
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge, size = 50, color = Colors.badgePurpleLight, style, isEventsBadge = false }) => {
  return (
    <View style={[styles.container, { width: size }, style]}>
      {isEventsBadge ? (
        <EventsBadgeIcon size={size} color={color} disabled={!badge?.achieved} value={badge?.count} />
      ) : (
        <ReviewsBadgeIcon size={size} color={color} disabled={!badge?.achieved} value={badge?.count} />
      )}
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

