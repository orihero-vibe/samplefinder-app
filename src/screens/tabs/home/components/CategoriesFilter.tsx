import React from 'react';
import FilterModal, { FilterOption } from './FilterModal';

interface CategoriesFilterProps {
  visible: boolean;
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
  categories: Array<{ $id: string; name: string; slug?: string }>;
}

const CategoriesFilter: React.FC<CategoriesFilterProps> = ({ 
  visible,
  selectedValues, 
  onToggle, 
  onClose,
  categories,
}) => {
  // Convert categories to FilterOption format
  const categoriesOptions: FilterOption[] = [
    ...categories.map((category) => ({
      id: category.$id,
      label: category.name,
      value: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
    })),
    // Add "View All" option at the end
    { id: 'view-all', label: 'View All', value: 'all' },
  ];

  return (
    <FilterModal
      visible={visible}
      title="Categories"
      options={categoriesOptions}
      selectedValues={selectedValues}
      onToggle={onToggle}
      onClose={onClose}
    />
  );
};

export default CategoriesFilter;

