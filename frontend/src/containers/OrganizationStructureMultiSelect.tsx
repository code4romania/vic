import React from 'react';
import { ActionMeta, MultiValue } from 'react-select';
import { DivisionType } from '../common/enums/division-type.enum';
import { IDivisionListItem } from '../common/interfaces/division.interface';
import MultiSelect from '../components/MultiSelect';
import { useDivisionsListItemsQuery } from '../services/division/division.service';

export interface IDivisionMultiListItem {
  value: string;
  label: string;
}

interface OrganizationStructureMultiSelectProps {
  type: DivisionType;
  value: IDivisionMultiListItem[];
  onChange: (
    newValue: MultiValue<IDivisionMultiListItem>,
    actionMeta: ActionMeta<IDivisionMultiListItem>,
  ) => void;
}

export const mapDivisionListItemToMultiSelectItem = (
  item: IDivisionListItem,
): IDivisionMultiListItem => ({
  value: item.id,
  label: item.name,
});

export const OrganizationStructureMultiSelect = ({
  type,
  value,
  onChange,
}: OrganizationStructureMultiSelectProps) => {
  const { data: divisionListItems } = useDivisionsListItemsQuery(type);

  return (
    <MultiSelect
      options={divisionListItems?.map(mapDivisionListItemToMultiSelectItem) || []}
      onChange={onChange}
      value={value}
    />
  );
};
