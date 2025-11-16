import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterModalProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  title,
  options,
  selectedValues,
  onToggle,
  onClose,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
          <Monicon name="mdi:close" size={24} color={Colors.blueColorMode} />
        </TouchableOpacity>
      </View>
      <View style={styles.optionsContainer}>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 16,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
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
    paddingHorizontal: 20,
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

