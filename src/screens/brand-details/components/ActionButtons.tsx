import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import SmallHeartIcon from '@/icons/SmallHeartIcon';
import HeartOutlineIcon from '@/icons/HeartOutlineIcon';
import { CalendarAddedIcon, CalendarAddIcon } from '@/icons';

interface ActionButtonsProps {
  onAddToCalendar: () => void;
  onAddFavorite: () => void;
  isFavorite: boolean;
  isAddedToCalendar?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAddToCalendar,
  onAddFavorite,
  isFavorite,
  isAddedToCalendar = false,
}) => {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onAddToCalendar}
        activeOpacity={0.7}
      >
        <View style={styles.actionIconWrap}>
          {isAddedToCalendar ? (
            <CalendarAddedIcon size={22} />
          ) : (
            <CalendarAddIcon size={22} />
          )}
        </View>
        <Text style={styles.actionButtonText}>
          {isAddedToCalendar ? 'Added to Calendar' : 'Add to Calendar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={onAddFavorite}
        activeOpacity={0.7}
      >
        <View style={styles.actionIconWrap}>
          {isFavorite ? (
            <SmallHeartIcon size={16} />
          ) : (
            <HeartOutlineIcon size={16} />
          )}
        </View>
        <Text style={styles.actionButtonText}>
          {isFavorite ? 'Favorite Brand' : 'Add Favorite Brand'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  actionIconWrap: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.blueColorMode,
  },
});

export default ActionButtons;

