import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

interface ActionButtonsProps {
  onAddToCalendar: () => void;
  onAddFavorite: () => void;
  isFavorite: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAddToCalendar,
  onAddFavorite,
  isFavorite,
}) => {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onAddToCalendar}
        activeOpacity={0.7}
      >
        <Monicon name="mdi:calendar-plus" size={24} color={Colors.blueColorMode} />
        <Text style={styles.actionButtonText}>Add to Calendar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={onAddFavorite}
        activeOpacity={0.7}
      >
        <Monicon
          name={isFavorite ? 'mdi:heart' : 'mdi:heart-outline'}
          size={24}
          color={Colors.blueColorMode}
        />
        <Text style={styles.actionButtonText}>Add Favorite Brand</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.blueColorMode,
  },
});

export default ActionButtons;

