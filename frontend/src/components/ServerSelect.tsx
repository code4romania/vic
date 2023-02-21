/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ComponentPropsWithoutRef, ReactNode, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import AsyncSelect from 'react-select/async';

export interface ServerSelectProps extends Omit<ComponentPropsWithoutRef<'select'>, 'value'> {
  label: string;
  value: { label: string; value: string };
  isMulti?: boolean;
  helper?: ReactNode;
  isClearable?: boolean;
  loadOptions: (search: string) => void;
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
  const [defaultValue, setDefaultValue] = useState<{ label: string; value: string }>();

  // cleanup any side effects of deounce
  useEffect(() => {
    return () => {
      debouncedLoadOptions.cancel();
    };
  }, []);

  const onSearch = (inputValue: string) => (inputValue?.length >= 3 ? loadOptions(inputValue) : []);

  const debouncedLoadOptions = useMemo(
    () =>
      debounce(onSearch, 500, {
        leading: true,
      }),
    [],
  );

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
        classNamePrefix="reactselect"
        loadOptions={onSearch as any}
        onChange={onChange as any}
        isClearable={isClearable}
        isMulti={isMulti}
        value={defaultValue}
      />
      {helper}
    </div>
  );
};

export default ServerSelect;
