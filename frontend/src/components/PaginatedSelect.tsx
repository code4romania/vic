import React, {
  AriaAttributes,
  ComponentPropsWithoutRef,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { ListItem } from '../common/interfaces/list-item.interface';
import { useTranslation } from 'react-i18next';

interface PaginatedSelectProps extends Omit<ComponentPropsWithoutRef<'select'>, 'value'> {
  label: string;
  value?: ListItem;
  isMulti?: boolean;
  helper?: ReactNode;
  isClearable?: boolean;
  placeholder?: string;
  loadOptions: (
    searchQuery: string,
    loadedOptions: ListItem[],
    { page }: { page: number },
  ) => Promise<{
    options: { value: string; label: string }[];
    hasMore: boolean;
    additional: { page: number };
  }>;
  /** Indicate if the value entered in the field is invalid **/
  'aria-invalid'?: AriaAttributes['aria-invalid'];
}

const PaginatedSelect = ({
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
  ...props
}: PaginatedSelectProps) => {
  const { t } = useTranslation('general');

  const [defaultValue, setDefaultValue] = useState<ListItem>();

  useEffect(() => {
    setDefaultValue(value);
  }, [value]);

  return (
    <div className="flex gap-1 flex-col">
      {label && <label htmlFor={`${label}__select`}>{label}</label>}
      <AsyncPaginate
        id={`${id}__select`}
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
        loadOptions={loadOptions}
        onChange={onChange}
        isClearable={isClearable}
        isMulti={isMulti}
        value={defaultValue || null}
        isDisabled={disabled}
        noOptionsMessage={({ inputValue }) =>
          inputValue.length < 2 ? `${t('type_for_options')}` : `${t('no_options')}`
        }
        additional={{
          page: 1,
        }}
        debounceTimeout={500}
      />
      {helper}
    </div>
  );
};

export default PaginatedSelect;
