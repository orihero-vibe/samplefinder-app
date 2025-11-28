import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';

export type FilterType = 'radius' | 'dates' | 'categories' | 'reset';

interface FilterButtonsProps {
  selectedFilter: FilterType | null;
  onFilterPress: (filter: FilterType) => void;
  radiusCount?: number;
  datesCount?: number;
  categoriesCount?: number;
  hasAnyFilters?: boolean;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  selectedFilter,
  onFilterPress,
  radiusCount = 0,
  datesCount = 0,
  categoriesCount = 0,
  hasAnyFilters = false,
}) => {
  const handleFilterPress = (filter: FilterType) => {
    onFilterPress(filter);
  };

  const getButtonText = (label: string, count: number) => {
    return count > 0 ? `${label} (${count})` : label;
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            styles.filterButtonSpacing,
            (selectedFilter === 'radius' || radiusCount > 0) && styles.filterButtonSelected,
          ]}
          onPress={() => handleFilterPress('radius')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterButtonText,
              (selectedFilter === 'radius' || radiusCount > 0) && styles.filterButtonTextSelected,
            ]}
          >
            {getButtonText('Radius', radiusCount)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            styles.filterButtonSpacing,
            (selectedFilter === 'dates' || datesCount > 0) && styles.filterButtonSelected,
          ]}
          onPress={() => handleFilterPress('dates')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterButtonText,
              (selectedFilter === 'dates' || datesCount > 0) && styles.filterButtonTextSelected,
            ]}
          >
            {getButtonText('Dates', datesCount)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            styles.filterButtonSpacing,
            (selectedFilter === 'categories' || categoriesCount > 0) && styles.filterButtonSelected,
          ]}
          onPress={() => handleFilterPress('categories')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterButtonText,
              (selectedFilter === 'categories' || categoriesCount > 0) && styles.filterButtonTextSelected,
            ]}
          >
            {getButtonText('Categories', categoriesCount)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            styles.filterButtonReset,
            hasAnyFilters && styles.filterButtonResetEnabled,
          ]}
          onPress={() => handleFilterPress('reset')}
          activeOpacity={0.7}
          disabled={!hasAnyFilters}
        >
          <Text
            style={[
              styles.filterButtonTextReset,
              hasAnyFilters && styles.filterButtonTextResetEnabled,
            ]}
          >
            Reset
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    backgroundColor: Colors.white,
    width: '100%',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  filterButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.blueColorMode,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonSpacing: {
    marginRight: 10,
  },
  filterButtonSelected: {
    backgroundColor: Colors.blueColorMode,
    borderColor: Colors.blueColorMode,
  },
  filterButtonReset: {
    backgroundColor: '#E0E0E0',
    borderColor: '#9E9E9E',
  },
  filterButtonResetEnabled: {
    backgroundColor: Colors.blueColorMode,
    borderColor: Colors.blueColorMode,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.brandPurpleDeep,
  },
  filterButtonTextSelected: {
    color: Colors.white,
  },
  filterButtonTextReset: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#9E9E9E',
  },
  filterButtonTextResetEnabled: {
    color: Colors.white,
  },
});

export default FilterButtons;

