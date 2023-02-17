/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { ComponentPropsWithoutRef, ReactNode, useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import debounce from 'debounce-promise';
import { SelectItem } from './Select';
// import './ServerSelect.css';

export interface ServerSelectProps extends Omit<ComponentPropsWithoutRef<'select'>, 'value'> {
  label: string;
  value: SelectItem<string>;
  isMulti?: boolean;
  helper?: ReactNode;
  isClearable?: boolean;
  loadOptions: (value: string) => void;
}

const ServerSelect = ({
  id,
  isMulti,
  loadOptions,
  value,
  onChange,
  placeholder,
  label,
  isClearable,
  helper,
}: ServerSelectProps) => {
  const [defaultValue, setDefaultValue] = useState<any>();

  const onSearch = (inputValue: string) => (inputValue?.length >= 3 ? loadOptions(inputValue) : []);

  const debouncedLoadOptions = debounce(onSearch, 500, {
    leading: true,
  });

  useEffect(() => {
    setDefaultValue(value);
  }, [value]);

  return (
    <div className="flex gap-1 flex-col">
      {label && <label htmlFor={`${label}__select`}>{label}</label>}
      <AsyncSelect
        id={`${id}__select`}
        cacheOptions
        placeholder={placeholder}
        // classNamePrefix="reactselect"
        loadOptions={debouncedLoadOptions as any}
        onChange={onChange}
        isClearable={isClearable}
        isMulti={isMulti}
        value={defaultValue}
      />
      {helper}
    </div>
  );
};

export default ServerSelect;
