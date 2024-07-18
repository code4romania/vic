/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  AriaAttributes,
  ComponentPropsWithoutRef,
  ReactNode,
  useEffect,
  useState,
} from 'react';
// import AsyncSelect from 'react-select/async';
import { ListItem } from '../common/interfaces/list-item.interface';
// import { debouncePromise } from '../common/utils/utils';
// import { useTranslation } from 'react-i18next';
import Select from 'react-select';

export interface ServerSelectProps extends Omit<ComponentPropsWithoutRef<'select'>, 'value'> {
  label: string;
  value?: ListItem;
  isMulti?: boolean;
  helper?: ReactNode;
  isClearable?: boolean;
  onInputChange: any;
  placeholder?: string;
  options: any;
  // loadOptions: () => void;
  onMenuScrollToBottom?: () => void;
  /** Indicate if the value entered in the field is invalid **/
  'aria-invalid'?: AriaAttributes['aria-invalid'];
}

// TODO: set correct types for loadOptions and onChange methods
const ServerSelect = ({
  id,
  isMulti,
  options,
  value,
  onChange,
  onInputChange,
  placeholder,
  label,
  isClearable,
  helper,
  disabled,

  onMenuScrollToBottom,
  ...props
}: ServerSelectProps) => {
  // const { t } = useTranslation('general');
  const [defaultValue, setDefaultValue] = useState<ListItem>();

  useEffect(() => {
    setDefaultValue(value);
  }, [value]);

  return (
    <div className="flex gap-1 flex-col">
      {label && <label htmlFor={`${label}__select`}>{label}</label>}
      <Select
        id={`${id}__select`}
        // cacheOptions
        options={options}
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
        // loadOptions={onLoadOptions}
        onChange={onChange as any}
        isClearable={isClearable}
        isMulti={isMulti}
        value={defaultValue || null}
        isDisabled={disabled}
        // defaultOptions={true}
        // noOptionsMessage={({ inputValue }) =>
        //   inputValue.length < 2 ? `${t('type_for_options')}` : `${t('no_options')}`
        // }
        onMenuScrollToBottom={onMenuScrollToBottom}
        onInputChange={onInputChange}
      />
      {helper}
    </div>
  );
};

export default ServerSelect;
