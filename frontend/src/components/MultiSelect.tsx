import React from 'react';
import Select from 'react-select';
import { SelectItem, SelectProps } from './Select';
export interface MultiSelectProps extends Omit<SelectProps<string>, 'onChange' | 'selected'> {
  onChange: (items: SelectItem<string>[]) => void;
  selected?: SelectItem<string>[];
  isDisabled?: boolean;
}

const MultiSelect = ({
  selected,
  options,
  placeholder,
  label,
  onChange,
  helper,
  isDisabled,
}: MultiSelectProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label>{label}</label>
      <Select
        placeholder={placeholder}
        closeMenuOnSelect={false}
        classNamePrefix="reactselect"
        isMulti={true}
        onChange={onChange as never}
        value={selected}
        options={options}
        isDisabled={isDisabled}
        isClearable
        getOptionLabel={(option) => option.value}
        getOptionValue={(option) => option.key}
      />
      {helper}
    </div>
  );
};

export default MultiSelect;
