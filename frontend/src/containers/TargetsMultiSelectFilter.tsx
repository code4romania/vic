import React, { useEffect, useState } from 'react';
import { DivisionType } from '../common/enums/division-type.enum';
import { mapDivisionListItemToSelectItem } from '../common/utils/utils';
import MultiSelect, { MultiSelectProps } from '../components/MultiSelect';
import { SelectItem } from '../components/Select';
import { useDivisionsListItems } from '../services/division/division.service';

interface TargetsMultiSelectFilterProps extends Omit<MultiSelectProps, 'options' | 'selected'> {
  selectedValues?: string[] | null;
  selection?: SelectItem<string>[];
}

const TargetsMultiSelect = ({
  selectedValues,
  selection,
  onChange,
  ...props
}: TargetsMultiSelectFilterProps) => {
  const { data: divisionListItems } = useDivisionsListItems(DivisionType.DEPARTMENT);
  const [selectedItems, setSelectedItems] = useState<SelectItem<string>[]>([]);

  // on init filter if there are query values we get we map them to select items
  useEffect(() => {
    let filteredSelection = selection;
    // check if elements come as values rather than selections
    if (
      selectedValues &&
      selectedValues?.length > 0 &&
      selection?.length === 0 &&
      divisionListItems
    ) {
      filteredSelection = divisionListItems?.items
        .filter((item) => selectedValues?.includes(item.name))
        .map(mapDivisionListItemToSelectItem);
      onChange(filteredSelection as SelectItem<string>[]);
    }
    setSelectedItems(filteredSelection || []);
  }, [selectedValues, divisionListItems]);

  return (
    <MultiSelect
      {...props}
      selected={(selectedItems as SelectItem<string>[]) || []}
      onChange={onChange}
      options={
        divisionListItems && divisionListItems?.items.length > 0
          ? divisionListItems?.items.map(mapDivisionListItemToSelectItem)
          : []
      }
    />
  );
};

export default TargetsMultiSelect;
