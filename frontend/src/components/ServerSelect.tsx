import React, {
  AriaAttributes,
  ComponentPropsWithoutRef,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import AsyncSelect from 'react-select/async';
import { ListItem } from '../common/interfaces/list-item.interface';

export interface ServerSelectProps extends Omit<ComponentPropsWithoutRef<'select'>, 'value'> {
  label: string;
  value?: ListItem;
  isMulti?: boolean;
  helper?: ReactNode;
  isClearable?: boolean;
  placeholder?: string;
  loadOptions: (inputValue: string, callback: (options) => void) => void;
  onMenuScrollToBottom?: () => void;
  /** Indicate if the value entered in the field is invalid **/
  'aria-invalid'?: AriaAttributes['aria-invalid'];
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
  disabled,
  onMenuScrollToBottom,
  ...props
}: ServerSelectProps) => {
  const [defaultValue, setDefaultValue] = useState<ListItem>();

  useEffect(() => {
    setDefaultValue(value);
  }, [value]);

  return (
    <div className="flex gap-1 flex-col">
      {label && <label htmlFor={`${label}__select`}>{label}</label>}
      <AsyncSelect
        id={`${id}__select`}
        loadOptions={loadOptions}
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
        onChange={onChange as never}
        isClearable={isClearable}
        isMulti={isMulti}
        value={defaultValue || null}
        isDisabled={disabled}
        onMenuScrollToBottom={onMenuScrollToBottom}
        defaultOptions
      />
      {helper}
    </div>
  );
};

export default ServerSelect;
