import React, { useEffect } from 'react';
import { DivisionType } from '../common/enums/division-type.enum';
import { mapDivisionListItemToSelectItem } from '../common/utils/utils';
import MultiSelect, { MultiSelectProps } from '../components/MultiSelect';
import { useDivisionsListItems } from '../services/division/division.service';

interface TargetsMultiSelectFilterProps extends Omit<MultiSelectProps, 'options'> {
  defaultValues?: string[];
}

const TargetsMultiSelectFilter = ({
  onChange,
  defaultValues,
  selected,
  ...props
}: TargetsMultiSelectFilterProps) => {
  const { data: divisionListItems } = useDivisionsListItems(DivisionType.DEPARTMENT);

  // on init filter if there are query values we get we map them to select items
  useEffect(() => {
    // check if elements come as values rather than selections
    if (defaultValues && defaultValues.length > 0 && selected?.length === 0 && divisionListItems) {
      const defaultSelection = divisionListItems?.items
        .filter((item) => defaultValues?.includes(item.name))
        .map(mapDivisionListItemToSelectItem);
      onChange(defaultSelection);
    }
  }, [divisionListItems]);

  return (
    <MultiSelect
      {...props}
      onChange={onChange}
      selected={selected}
      options={
        divisionListItems && divisionListItems?.items.length > 0
          ? divisionListItems?.items.map(mapDivisionListItemToSelectItem)
          : []
      }
    />
  );
};

export default TargetsMultiSelectFilter;
