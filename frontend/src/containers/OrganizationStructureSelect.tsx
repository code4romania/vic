import React from 'react';
import { DivisionType } from '../common/enums/division-type.enum';
import { mapDivisionListItemToSelectItem } from '../common/utils/utils';
import Select, { SelectProps } from '../components/Select';
import { useDivisionsListItems } from '../services/division/division.service';

interface OrganizationStructureSelectProps extends Omit<SelectProps<string>, 'options'> {
  type: DivisionType;
}

const OrganizationStructureSelect = ({
  type,
  ...selectProps
}: OrganizationStructureSelectProps) => {
  const { data: divisionListItems } = useDivisionsListItems(type);

  return (
    <Select
      {...selectProps}
      options={
        divisionListItems && divisionListItems.items?.length > 0
          ? divisionListItems.items?.map(mapDivisionListItemToSelectItem)
          : []
      }
    />
  );
};

export default OrganizationStructureSelect;
