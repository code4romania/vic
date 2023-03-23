import React from 'react';
import Select from 'react-select';
import { SelectItem, SelectProps } from './Select';
export interface MultiSelectProps extends Omit<SelectProps<string>, 'onChange' | 'selected'> {
  onChange: (items: SelectItem<string>[]) => void;
  selected?: SelectItem<string>[];
  isDisabled?: boolean;
  errorMessage?: string;
}

const MultiSelect = ({
  selected,
  options,
  placeholder,
  label,
  onChange,
  helper,
  isDisabled,
  errorMessage,
}: MultiSelectProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label>{label}</label>
      <Select
        placeholder={placeholder}
        closeMenuOnSelect={false}
        classNamePrefix="reactselect"
        classNames={{
          control: (state) => {
            if (errorMessage && state.isFocused) return 'error-and-focused';
            if (errorMessage) return 'error';
            return '';
          },
        }}
        isMulti={true}
        onChange={onChange as never}
        value={selected}
        options={options}
        isDisabled={isDisabled}
        isClearable
        getOptionLabel={(option) => option.value}
        getOptionValue={(option) => option.key}
      />
      {errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
    </div>
  );
};

export default MultiSelect;
