import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { CloseIcon } from '@/components';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 66; // paddingVertical 8*2 + icon 50

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  isAdult?: boolean;
}

export interface FilterButtonLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FilterModalProps {
  visible: boolean;
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
  userIsAdult?: boolean;
  buttonLayout?: FilterButtonLayout;
  /** When true, modal expands to bottom navigation instead of fixed max height */
  expandToBottom?: boolean;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  title,
  options,
  selectedValues,
  onToggle,
  onClose,
  userIsAdult = true,
  buttonLayout,
  expandToBottom = false,
}) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  // Calculate dropdown position based on button layout
  const DROPDOWN_WIDTH = SCREEN_WIDTH * 0.9; // 90% of screen width
  const DROPDOWN_MAX_HEIGHT = 350;
  const GAP_FROM_BUTTON = 8;
  const bottomNavHeight = TAB_BAR_HEIGHT + insets.bottom;

  const dropdownStyle = buttonLayout
    ? (() => {
        // Calculate position below the button
        let top = buttonLayout.y + buttonLayout.height + GAP_FROM_BUTTON;
        // Center the dropdown horizontally on screen
        let left = (SCREEN_WIDTH - DROPDOWN_WIDTH) / 2;

        const maxHeight = expandToBottom
          ? SCREEN_HEIGHT - top - bottomNavHeight - 20 // 80px for header and padding
          : DROPDOWN_MAX_HEIGHT;

        // Check if there's enough space below, if not, position above the button (only when not expandToBottom)
        if (!expandToBottom) {
          const spaceBelow = SCREEN_HEIGHT - top;
          if (spaceBelow < maxHeight && buttonLayout.y > maxHeight) {
            top = buttonLayout.y - maxHeight - GAP_FROM_BUTTON;
          }
        }

        return {
          position: 'absolute' as const,
          top,
          left,
          width: DROPDOWN_WIDTH,
          maxHeight,
        };
      })()
    : {
        position: 'absolute' as const,
        bottom: expandToBottom ? bottomNavHeight : 100,
        left: SCREEN_WIDTH * 0.05, // 5% margin on each side
        width: DROPDOWN_WIDTH,
        maxHeight: expandToBottom ? SCREEN_HEIGHT - bottomNavHeight - 80 : DROPDOWN_MAX_HEIGHT,
      };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backdrop}
        activeOpacity={1} 
        onPress={onClose}
      />
      <View style={[styles.dropdownContainer, dropdownStyle]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
            <CloseIcon size={20} color={Colors.blueColorMode} />
          </TouchableOpacity>
        </View>
        <ScrollView 
          style={styles.optionsContainer}
          contentContainerStyle={styles.optionsContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {options.map((option) => {
            // Special handling for "View All" option
            // "View All" is selected when no other filters are selected
            const isViewAll = option.value === 'all';
            const isSelected = isViewAll 
              ? selectedValues.length === 0 
              : selectedValues.includes(option.value);
            
            // Grey out 21+ categories for under-21 users
            const isAdultCategory = option.isAdult === true;
            const shouldGreyOut = isAdultCategory && !userIsAdult;

            return (
              <TouchableOpacity
                key={option.id}
                style={styles.optionRow}
                onPress={() => onToggle(option.value)}
                activeOpacity={0.7}
                disabled={shouldGreyOut}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected, shouldGreyOut && styles.checkboxDisabled]}>
                  {isSelected && (
                    <Monicon name="mdi:check" size={16} color={Colors.white} />
                  )}
                </View>
                <Text style={[styles.optionText, shouldGreyOut && styles.optionTextDisabled]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dropdownContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    flexGrow: 0,
  },
  optionsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.blueColorMode,
    backgroundColor: Colors.white,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.blueColorMode,
    borderColor: Colors.blueColorMode,
  },
  checkboxDisabled: {
    borderColor: '#9E9E9E',
    backgroundColor: Colors.white,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.blueColorMode,
    flex: 1,
  },
  optionTextDisabled: {
    color: '#9E9E9E',
  },
});

export default FilterModal;

