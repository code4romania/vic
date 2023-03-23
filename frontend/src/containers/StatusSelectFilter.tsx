import React from 'react';
import Select, { SelectProps } from '../components/Select';

interface StatusSelectFilter<T> extends Omit<SelectProps<T>, 'selected'> {
  selected?: T | null;
}

const StatusSelectFilter = <T extends React.Key>({
  selected,
  options,
  ...props
}: StatusSelectFilter<T>) => {
  const selectedItem = options.find((option) => option.value === selected);
  return <Select selected={selectedItem || undefined} options={options} {...props} />;
};

export default StatusSelectFilter;
