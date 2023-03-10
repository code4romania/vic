import React from 'react';
import { DivisionType } from '../common/enums/division-type.enum';
import { mapDivisionListItemToSelectItem } from '../common/utils/utils';
import MultiSelect, { MultiSelectProps } from '../components/MultiSelect';
import { useDivisionsListItems } from '../services/division/division.service';

type TargetsMultiSelectProps = Omit<MultiSelectProps, 'options'>;

const TargetsMultiSelect = (selectProps: TargetsMultiSelectProps) => {
  const { data: divisionListItems } = useDivisionsListItems(DivisionType.DEPARTMENT);

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

export default TargetsMultiSelect;
