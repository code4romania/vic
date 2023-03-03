import React, { useEffect, useState } from 'react';
import Select, { ActionMeta, MultiValue } from 'react-select';

export interface IMultiListItem {
  value: string;
  label: string;
}

export function mapItemToMultiListItem<T extends { id: string; name: string }>(
  item: T,
): IMultiListItem {
  return {
    value: item.id,
    label: item.name,
  };
}

interface MultiSelectProps {
  onChange: (newValue: MultiValue<IMultiListItem>, actionMeta: ActionMeta<IMultiListItem>) => void;
  value: IMultiListItem[];
  options?: IMultiListItem[];
  placeholder?: string;
}

const MultiSelect = ({ onChange, value, options, placeholder }: MultiSelectProps) => {
  const [defaultValue, setDefaultValue] = useState<IMultiListItem[]>([]);

  useEffect(() => {
    setDefaultValue(value);
  }, [value]);

  return (
    <div>
      <Select
        placeholder={placeholder}
        closeMenuOnSelect={false}
        classNamePrefix="reactselect"
        isMulti={true}
        onChange={onChange}
        value={defaultValue}
        options={options}
      />
    </div>
  );
};

export default MultiSelect;
