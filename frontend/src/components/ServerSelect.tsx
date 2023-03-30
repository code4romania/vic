/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  AriaAttributes,
  ComponentPropsWithoutRef,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import debounce from 'lodash.debounce';
import AsyncSelect from 'react-select/async';
import { ListItem } from '../common/interfaces/list-item.interface';

export interface ServerSelectProps extends Omit<ComponentPropsWithoutRef<'select'>, 'value'> {
  label: string;
  value?: ListItem;
  isMulti?: boolean;
  helper?: ReactNode;
  isClearable?: boolean;
  loadOptions: (search: string) => void;
  /** Indicate if the value entered in the field is invalid **/
  'aria-invalid'?: AriaAttributes['aria-invalid'];
}

// TODO: set correct types for loadOptions and onChange methods
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
  ...props
}: ServerSelectProps) => {
  const [defaultValue, setDefaultValue] = useState<ListItem>();

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
        classNames={{
          control: (state) => {
            if (props['aria-invalid'] && state.isFocused) return 'error-and-focused';
            if (props['aria-invalid']) return 'error';
            if (state.isFocused) return 'focused';
            return '';
          },
        }}
        placeholder={placeholder}
        classNamePrefix="reactselect"
        loadOptions={onSearch as any}
        onChange={onChange as any}
        isClearable={isClearable}
        isMulti={isMulti}
        value={defaultValue || null}
      />
      {helper}
    </div>
  );
};

export default ServerSelect;
