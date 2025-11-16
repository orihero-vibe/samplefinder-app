import React from 'react';
import FilterModal, { FilterOption } from './FilterModal';

interface CategoriesFilterProps {
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
}

const categoriesOptions: FilterOption[] = [
  { id: '1', label: 'Alcohol (21+)', value: 'alcohol' },
  { id: '2', label: 'Beverages', value: 'beverages' },
  { id: '3', label: 'Cannabis (21+)', value: 'cannabis' },
  { id: '4', label: 'Casinos (21+)', value: 'casinos' },
  { id: '5', label: 'Food - Snacks', value: 'food-snacks' },
  { id: '6', label: 'Groceries', value: 'groceries' },
  { id: '7', label: 'Gym & Fitness', value: 'gym-fitness' },
  { id: '8', label: 'Health & Beauty', value: 'health-beauty' },
  { id: '9', label: 'Household', value: 'household' },
  { id: '10', label: 'Kids & Babies', value: 'kids-babies' },
  { id: '11', label: 'Pet', value: 'pet' },
];

const CategoriesFilter: React.FC<CategoriesFilterProps> = ({ selectedValues, onToggle, onClose }) => {
  return (
    <FilterModal
      title="Categories"
      options={categoriesOptions}
      selectedValues={selectedValues}
      onToggle={onToggle}
      onClose={onClose}
    />
  );
};

export default CategoriesFilter;

