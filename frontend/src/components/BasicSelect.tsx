import React, { AriaAttributes } from 'react';
import Select, { Props as SelectProps } from 'react-select';
import { ListItem } from '../common/interfaces/list-item.interface';

interface BasicSelectProps extends SelectProps {
  label: string;
  defaultValue?: ListItem;
  onSelect: (item: ListItem) => void;
  errorMessage?: string;
  helper?: string;
  'aria-invalid'?: AriaAttributes['aria-invalid'];
}

const BasicSelect = ({
  id,
  label,
  placeholder,
  errorMessage,
  onSelect,
  options,
  defaultValue,
  helper,
  ...props
}: BasicSelectProps) => {
  return (
    <div className="flex gap-1 flex-col">
      {label && <label htmlFor={`${label}__select`}>{label}</label>}
      <Select
        id={`${id}__select`}
        placeholder={placeholder}
        options={options}
        className="basic-select"
        classNamePrefix="reactselect"
        isSearchable={props.isSearchable || true}
        classNames={{
          control: (state) => {
            if (props['aria-invalid'] && state.isFocused) return 'error-and-focused';
            if (props['aria-invalid']) return 'error';
            if (state.isFocused) return 'focused';
            return '';
          },
        }}
        aria-invalid={!!errorMessage}
        onChange={onSelect as never}
        value={defaultValue || null}
      />
      {errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
    </div>
  );
};

export default BasicSelect;
