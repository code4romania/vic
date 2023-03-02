import React from 'react';
import { UseFormRegister, UseFormResetField } from 'react-hook-form';
import { ActionMeta, MultiValue } from 'react-select';
import i18n from '../common/config/i18n';
import { DivisionType } from '../common/enums/division-type.enum';
import { IDivisionListItem } from '../common/interfaces/division.interface';
import { AnnouncementFormTypes } from '../components/AnnouncementForm';
import MultiSelect from '../components/MultiSelect';
import { useDivisionsListItemsQuery } from '../services/division/division.service';

export interface IDivisionMultiListItem {
  value: string;
  label: string;
}

interface OrganizationStructureMultiSelectProps {
  label: string;
  placeholder?: string;
  type: DivisionType;
  value: IDivisionMultiListItem[];
  onChange: (
    newValue: MultiValue<IDivisionMultiListItem>,
    actionMeta: ActionMeta<IDivisionMultiListItem>,
  ) => void;
  resetField: UseFormResetField<AnnouncementFormTypes>;
  register: UseFormRegister<AnnouncementFormTypes>;
}

export const mapDivisionListItemToMultiSelectItem = (
  item: IDivisionListItem,
): IDivisionMultiListItem => ({
  value: item.id,
  label: item.name,
});

export const OrganizationStructureMultiSelect = ({
  label,
  placeholder,
  type,
  value,
  onChange,
  resetField,
  register,
}: OrganizationStructureMultiSelectProps) => {
  const { data: divisionListItems } = useDivisionsListItemsQuery(type);
  const [isAllOrganization, setIsAllOrganization] = React.useState<boolean>(false);

  const toggleAllOrganization = () => {
    setIsAllOrganization(!isAllOrganization);
    resetField('targets');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label>{label}</label>
        {!isAllOrganization && (
          <MultiSelect
            placeholder={placeholder}
            options={divisionListItems?.map(mapDivisionListItemToMultiSelectItem) || []}
            onChange={onChange}
            value={value}
          />
        )}
      </div>
      <div className="flex flex-row gap-3">
        <input
          {...register('targets')}
          className="self-center rounded-[4px] border-cool-gray-300"
          type="checkbox"
          onClick={toggleAllOrganization}
          checked={isAllOrganization}
        />
        <label>{i18n.t('announcement:all_organization')}</label>
      </div>
    </div>
  );
};
