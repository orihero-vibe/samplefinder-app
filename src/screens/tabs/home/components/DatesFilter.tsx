import React from 'react';
import FilterModal, { FilterOption } from './FilterModal';

interface DatesFilterProps {
  visible: boolean;
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
}

const datesOptions: FilterOption[] = [
  { id: '1', label: 'Today', value: 'today' },
  { id: '2', label: 'Next 3 Days', value: '3days' },
  { id: '3', label: 'Next 5 Days', value: '5days' },
  { id: '4', label: 'Next Week', value: 'week' },
  { id: '5', label: 'View All', value: 'all' },
];

const DatesFilter: React.FC<DatesFilterProps> = ({ visible, selectedValues, onToggle, onClose }) => {
  return (
    <FilterModal
      visible={visible}
      title="Dates"
      options={datesOptions}
      selectedValues={selectedValues}
      onToggle={onToggle}
      onClose={onClose}
    />
  );
};

export default DatesFilter;

