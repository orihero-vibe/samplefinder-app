import React from 'react';
import FilterModal, { FilterOption, FilterButtonLayout } from './FilterModal';

interface RadiusFilterProps {
  visible: boolean;
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
  buttonLayout?: FilterButtonLayout;
}

const radiusOptions: FilterOption[] = [
  { id: '1', label: '< 5 miles', value: '5' },
  { id: '2', label: '< 10 miles', value: '10' },
  { id: '3', label: '< 25 miles', value: '25' },
  { id: '4', label: '< 50 miles', value: '50' },
];

const RadiusFilter: React.FC<RadiusFilterProps> = ({ visible, selectedValues, onToggle, onClose, buttonLayout }) => {
  return (
    <FilterModal
      visible={visible}
      title="Radius"
      options={radiusOptions}
      selectedValues={selectedValues}
      onToggle={onToggle}
      onClose={onClose}
      buttonLayout={buttonLayout}
    />
  );
};

export default RadiusFilter;

