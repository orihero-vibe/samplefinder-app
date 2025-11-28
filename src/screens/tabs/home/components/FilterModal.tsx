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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    flex: 1,
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

