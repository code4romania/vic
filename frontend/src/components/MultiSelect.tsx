import React, { useEffect, useState } from 'react';
import Select, { ActionMeta, MultiValue } from 'react-select';
import { SelectItem } from './Select';

interface MultiSelectProps {
  onChange: (
    newValue: MultiValue<SelectItem<string>>,
    actionMeta: ActionMeta<SelectItem<string>>,
  ) => void;
  value: SelectItem<string>[];
  options: SelectItem<string>[];
}

const MultiSelect = ({ onChange, value, options }: MultiSelectProps) => {
  const [defaultValue, setDefaultValue] = useState<SelectItem<string>[]>([]);

  useEffect(() => {
    setDefaultValue(value);
  }, [value]);

  return (
    <div>
      <Select
        classNamePrefix="reactselect"
        isClearable={true}
        isMulti={true}
        onChange={onChange}
        defaultValue={defaultValue}
        options={options}
      />
    </div>
  );
};

export default MultiSelect;
