import React, { useEffect, useState } from 'react';
import Select, { ActionMeta, MultiValue } from 'react-select';
import { IDivisionMultiListItem } from '../containers/OrganizationStructureMultiSelect';

interface MultiSelectProps {
  onChange: (
    newValue: MultiValue<IDivisionMultiListItem>,
    actionMeta: ActionMeta<IDivisionMultiListItem>,
  ) => void;
  value: IDivisionMultiListItem[];
  options: IDivisionMultiListItem[];
  placeholder?: string;
}

const MultiSelect = ({ onChange, value, options, placeholder }: MultiSelectProps) => {
  const [defaultValue, setDefaultValue] = useState<IDivisionMultiListItem[]>([]);

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
