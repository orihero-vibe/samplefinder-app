import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

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
        <Monicon 
          name={isAddedToCalendar ? 'mdi:calendar-check' : 'mdi:calendar-plus'} 
          size={20} 
          color={Colors.blueColorMode} 
        />
        <Text style={styles.actionButtonText}>
          {isAddedToCalendar ? 'Added to Calendar' : 'Add to Calendar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={onAddFavorite}
        activeOpacity={0.7}
      >
        <Monicon
          name={isFavorite ? 'mdi:heart' : 'mdi:heart-outline'}
          size={20}
          color={Colors.blueColorMode}
        />
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.blueColorMode,
  },
});

export default ActionButtons;

