import React, { AriaAttributes } from 'react';
import Select from 'react-select';
import { SelectItem, SelectProps } from './Select';
export interface MultiSelectProps extends Omit<SelectProps<string>, 'onChange' | 'selected'> {
  onChange: (items: SelectItem<string>[]) => void;
  selected?: SelectItem<string>[];
  isDisabled?: boolean;
  /** Indicate if the value entered in the field is invalid **/
  'aria-invalid'?: AriaAttributes['aria-invalid'];
}

const MultiSelect = ({
  selected,
  options,
  placeholder,
  label,
  onChange,
  helper,
  isDisabled,
  ...props
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
            if (props['aria-invalid'] && state.isFocused) return 'error-and-focused';
            if (props['aria-invalid']) return 'error';
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
      {helper}
    </div>
  );
};

export default MultiSelect;
