import React from 'react';
import { ActivityTypeStatus } from '../common/enums/activity-type-status.enum';
import { mapDivisionListItemToSelectItem } from '../common/utils/utils';
import MultiSelect, { MultiSelectProps } from '../components/MultiSelect';
import { useActivityTypeListItemsQuery } from '../services/activity-type/activity-type.service';

type ActivityTypesSelectProps = Omit<MultiSelectProps, 'options'>;

const ActivityTypesSelect = (selectProps: ActivityTypesSelectProps) => {
  const { data: divisionListItems } = useActivityTypeListItemsQuery({
    status: ActivityTypeStatus.ACTIVE,
  });

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
