import React from 'react';
import { DivisionType } from '../common/enums/division-type.enum';
import { IDivisionListItem } from '../common/interfaces/division.interface';
import Select, { SelectItem, SelectProps } from '../components/Select';
import { useDivisionsListItemsQuery } from '../services/division/division.service';

interface OrganizationStructureSelectProps extends Omit<SelectProps<string>, 'options'> {
  type: DivisionType;
}

const OrganizationStructureSelect = ({
  type,
  ...selectProps
}: OrganizationStructureSelectProps) => {
  const { data: divisionListItems } = useDivisionsListItemsQuery(type);

  const mapDivisionListItemToSelectItem = (item: IDivisionListItem): SelectItem<string> => ({
    key: item.id,
    value: item.name,
  });

  return (
    <Select
      {...selectProps}
      options={
        divisionListItems && divisionListItems?.length > 0
          ? divisionListItems?.map(mapDivisionListItemToSelectItem)
          : []
      }
    />
  );
};

export default OrganizationStructureSelect;
