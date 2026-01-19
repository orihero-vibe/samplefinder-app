import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterModalProps {
  visible: boolean;
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  title,
  options,
  selectedValues,
  onToggle,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backdrop}
        activeOpacity={1} 
        onPress={onClose}
      />
      <View style={styles.dropdownContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
            <Monicon name="mdi:close" size={24} color={Colors.blueColorMode} />
          </TouchableOpacity>
        </View>
        <ScrollView 
          style={styles.optionsContainer}
          contentContainerStyle={styles.optionsContent}
          showsVerticalScrollIndicator={false}
        >
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <TouchableOpacity
                key={option.id}
                style={styles.optionRow}
                onPress={() => onToggle(option.value)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && (
                    <Monicon name="mdi:check" size={18} color={Colors.white} />
                  )}
                </View>
                <Text style={[styles.optionText, !isSelected && styles.optionTextDisabled]}>
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
    position: 'absolute',
    bottom: 100, // Position above the bottom tab bar
    left: 20,
    right: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    maxHeight: '60%',
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    maxHeight: 400,
  },
  optionsContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.blueColorMode,
    backgroundColor: Colors.white,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.blueColorMode,
    borderColor: Colors.blueColorMode,
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.blueColorMode,
  },
  optionTextDisabled: {
    color: '#9E9E9E',
  },
});

export default FilterModal;

