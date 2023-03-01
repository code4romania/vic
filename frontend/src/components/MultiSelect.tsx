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
}

const MultiSelect = ({ onChange, value, options }: MultiSelectProps) => {
  const [defaultValue, setDefaultValue] = useState<IDivisionMultiListItem[]>([]);

  useEffect(() => {
    setDefaultValue(value);
  }, [value]);

  return (
    <div>
      <Select
        closeMenuOnSelect={false}
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
