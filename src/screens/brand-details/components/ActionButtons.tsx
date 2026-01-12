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
          color={isFavorite ? '#8B1538' : Colors.blueColorMode}
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
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.blueColorMode,
  },
});

export default ActionButtons;

