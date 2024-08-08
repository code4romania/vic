import React from 'react';
import { DivisionType } from '../common/enums/division-type.enum';
import { mapDivisionListItemToSelectItem } from '../common/utils/utils';
import Select, { SelectProps } from '../components/Select';
import { useDivisionsListItems } from '../services/division/division.service';

interface OrganizationStructureSelectProps extends Omit<SelectProps<string>, 'options'> {
  type: DivisionType;
  defaultValue?: string;
}

const OrganizationStructureSelect = ({
  type,
  defaultValue,
  selected,
  onChange,
  ...selectProps
}: OrganizationStructureSelectProps) => {
  const { data: divisionListItems } = useDivisionsListItems(type);

  // handle scenario where we have a default value from queryParam
  if (!selected && defaultValue) {
    const defaultItem = divisionListItems?.items.find((item) => item.name === defaultValue);
    if (defaultItem) {
      const selected = mapDivisionListItemToSelectItem(defaultItem);
      onChange(selected);
    }
  }

  return (
    <Select
      {...selectProps}
      selected={selected}
      onChange={onChange}
      allowDeselect
      options={
        divisionListItems && divisionListItems.items?.length > 0
          ? divisionListItems.items?.map(mapDivisionListItemToSelectItem)
          : []
      }
    />
  );
};

export default OrganizationStructureSelect;
