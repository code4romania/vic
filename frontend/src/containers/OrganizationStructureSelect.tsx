import React from 'react';
import { DivisionType } from '../common/enums/division-type.enum';
import { mapDivisionListItemToSelectItem } from '../common/utils/utils';
import Select, { SelectItem, SelectProps } from '../components/Select';
import { useDivisionsListItems } from '../services/division/division.service';

interface OrganizationStructureSelectProps
  extends Omit<SelectProps<string>, 'options' | 'selected'> {
  type: DivisionType;
  selected?: SelectItem<string> | string | null;
}

const OrganizationStructureSelect = ({
  type,
  selected,
  onChange,
  ...selectProps
}: OrganizationStructureSelectProps) => {
  const { data: divisionListItems } = useDivisionsListItems(type);

  // handle scenario where selected comes as string from query param
  if (typeof selected === 'string') {
    const defaultItem = divisionListItems?.find((item) => item.name === selected);
    if (defaultItem) {
      selected = mapDivisionListItemToSelectItem(defaultItem);
      onChange(selected);
    }
  }

  return (
    <Select
      {...selectProps}
      onChange={onChange}
      selected={(selected as SelectItem<string>) || undefined}
      options={
        divisionListItems && divisionListItems?.length > 0
          ? divisionListItems?.map(mapDivisionListItemToSelectItem)
          : []
      }
    />
  );
};

export default OrganizationStructureSelect;
