import React from 'react';
import { mapDivisionListItemToSelectItem } from '../common/utils/utils';
import MultiSelect, { MultiSelectProps } from '../components/MultiSelect';
import { useActivityTypesQuery } from '../services/activity-type/activity-type.service';

type ActivityTypesSelectProps = Omit<MultiSelectProps, 'options'>;

const ActivityTypesSelect = (selectProps: ActivityTypesSelectProps) => {
  const { data: divisionListItems } = useActivityTypesQuery();

  return (
    <MultiSelect
      {...selectProps}
      options={
        divisionListItems && divisionListItems?.length > 0
          ? divisionListItems?.map(mapDivisionListItemToSelectItem)
          : []
      }
    />
  );
};

export default ActivityTypesSelect;
