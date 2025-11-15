import React from 'react';
import styles from './ChartFilter.module.css';

type FilterType = 'week' | 'month' | 'all';

interface ChartFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const ChartFilter: React.FC<ChartFilterProps> = ({ activeFilter, onFilterChange }) => {
  const filters: { key: FilterType; label: string }[] = [
    { key: 'week', label: 'Неделя' },
    { key: 'month', label: 'Месяц' },
    { key: 'all', label: 'Все время' },
  ];

  return (
    <div className={styles.filterContainer}>
      {filters.map(filter => (
        <button
          key={filter.key}
          className={`${styles.filterButton} ${activeFilter === filter.key ? styles.active : ''}`}
          onClick={() => onFilterChange(filter.key)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default ChartFilter;