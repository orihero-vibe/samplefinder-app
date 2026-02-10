import React from 'react';
import FilterModal, { FilterOption } from './FilterModal';

interface CategoriesFilterProps {
  visible: boolean;
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
  categories: Array<{ $id: string; name: string; slug?: string; isAdult?: boolean }>;
  userIsAdult?: boolean;
}

const CategoriesFilter: React.FC<CategoriesFilterProps> = ({ 
  visible,
  selectedValues, 
  onToggle, 
  onClose,
  categories,
  userIsAdult = true,
}) => {
  // Convert categories to FilterOption format
  const categoriesOptions: FilterOption[] = [
    ...categories.map((category) => ({
      id: category.$id,
      label: category.name,
      value: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
      isAdult: category.isAdult,
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
      userIsAdult={userIsAdult}
    />
  );
};

export default CategoriesFilter;

