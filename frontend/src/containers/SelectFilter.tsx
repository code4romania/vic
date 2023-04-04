import React from 'react';
import Select, { SelectProps } from '../components/Select';

interface SelectFilter extends Omit<SelectProps<string>, 'selected'> {
  defaultValue?: string | null;
}

const SelectFilter = ({ defaultValue, options, ...props }: SelectFilter) => {
  const selectedItem = options.find((option) => option.key === defaultValue);
  return <Select selected={selectedItem} options={options} {...props} />;
};

export default SelectFilter;
