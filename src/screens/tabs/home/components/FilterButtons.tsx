import React, { useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';

export type FilterType = 'radius' | 'dates' | 'categories' | 'reset';

export interface FilterButtonLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type MeasureCallback = (callback: (layout: FilterButtonLayout) => void) => void;

interface FilterButtonsProps {
  selectedFilter: FilterType | null;
  onFilterPress: (filter: FilterType, measureFn: MeasureCallback) => void;
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
  const radiusButtonRef = useRef<TouchableOpacity>(null);
  const datesButtonRef = useRef<TouchableOpacity>(null);
  const categoriesButtonRef = useRef<TouchableOpacity>(null);

  const createMeasureFn = (ref: React.RefObject<TouchableOpacity> | null): MeasureCallback => {
    return (callback) => {
      if (ref?.current) {
        ref.current.measureInWindow((x, y, width, height) => {
          callback({ x, y, width, height });
        });
      }
    };
  };

  const handleFilterPress = (filter: FilterType, ref: React.RefObject<TouchableOpacity> | null) => {
    if (filter === 'reset') {
      onFilterPress(filter, () => {});
    } else {
      onFilterPress(filter, createMeasureFn(ref));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            ref={radiusButtonRef}
            style={[
              styles.filterButton,
              styles.filterButtonSpacing,
              (selectedFilter === 'radius' || radiusCount > 0) && styles.filterButtonSelected,
            ]}
            onPress={() => handleFilterPress('radius', radiusButtonRef)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                (selectedFilter === 'radius' || radiusCount > 0) && styles.filterButtonTextSelected,
              ]}
            >
              Radius
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            ref={datesButtonRef}
            style={[
              styles.filterButton,
              styles.filterButtonSpacing,
              (selectedFilter === 'dates' || datesCount > 0) && styles.filterButtonSelected,
            ]}
            onPress={() => handleFilterPress('dates', datesButtonRef)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                (selectedFilter === 'dates' || datesCount > 0) && styles.filterButtonTextSelected,
              ]}
            >
              Dates
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            ref={categoriesButtonRef}
            style={[
              styles.filterButton,
              styles.filterButtonSpacing,
              (selectedFilter === 'categories' || categoriesCount > 0) && styles.filterButtonSelected,
            ]}
            onPress={() => handleFilterPress('categories', categoriesButtonRef)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                (selectedFilter === 'categories' || categoriesCount > 0) && styles.filterButtonTextSelected,
              ]}
            >
              Categories
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              styles.filterButtonReset,
              hasAnyFilters && styles.filterButtonResetEnabled,
            ]}
            onPress={() => handleFilterPress('reset', null)}
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: Colors.white,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.blueColorMode,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonSpacing: {
    marginRight: 8,
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
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
  },
  filterButtonTextSelected: {
    color: Colors.white,
  },
  filterButtonTextReset: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: '#9E9E9E',
  },
  filterButtonTextResetEnabled: {
    color: Colors.white,
  },
});

export default FilterButtons;

