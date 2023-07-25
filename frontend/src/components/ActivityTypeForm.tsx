import React from 'react';
import { Control, Controller, DeepRequired, FieldErrorsImpl } from 'react-hook-form';
import i18n from '../common/config/i18n';
import { DivisionType } from '../common/enums/division-type.enum';
import OrganizationStructureSelect from '../containers/OrganizationStructureSelect';
import FormInput from './FormInput';
import { SelectItem } from './Select';
import ImagePicker from './ImagePicker';

interface AccessCodeFormProps {
  control: Control<ActivityCategoryFormTypes, object>;
  errors: FieldErrorsImpl<DeepRequired<ActivityCategoryFormTypes>>;
}

export type ActivityCategoryFormTypes = {
  name: string;
  icon: string;
  department?: SelectItem<string>;
  branch?: SelectItem<string>;
  role?: SelectItem<string>;
};

const ActivityTypeForm = ({ control, errors }: AccessCodeFormProps) => {
  return (
    <form className="md:max-w-[30rem] my-2">
      <Controller
        key="name"
        name="name"
        control={control}
        render={({ field: { onChange, value } }) => {
          return (
            <FormInput
              type="text"
              readOnly={false}
              value={value}
              errorMessage={errors['name']?.message as string}
              label={i18n.t('activity_types:form.name.label').toString()}
              placeholder={`${i18n.t('activity_types:form.name.placeholder')}`}
              onChange={onChange}
              id="add-activity-form__name"
            />
          );
        }}
      />
      <Controller
        key="icon"
        name="icon"
        control={control}
        render={({ field: { onChange, value } }) => {
          return (
            <ImagePicker
              label={`${i18n.t('general:choose', {
                item: i18n.t('general:image').toLowerCase(),
              })}`}
              onChange={onChange}
              value={value}
            />
          );
        }}
      />
      <Controller
        name="branch"
        key="branch"
        control={control}
        render={({ field: { onChange, value } }) => {
          return (
            <OrganizationStructureSelect
              label={`${i18n.t('division:entity.branch')}`}
              placeholder={`${i18n.t('general:select', { item: '' })}`}
              onChange={onChange}
              selected={value}
              type={DivisionType.BRANCH}
            />
          );
        }}
      />
      <Controller
        name="department"
        key="department"
        control={control}
        render={({ field: { onChange, value } }) => {
          return (
            <OrganizationStructureSelect
              label={`${i18n.t('division:entity.department')}`}
              placeholder={`${i18n.t('general:select', { item: '' })}`}
              onChange={onChange}
              selected={value}
              type={DivisionType.DEPARTMENT}
            />
          );
        }}
      />
      <Controller
        name="role"
        key="role"
        control={control}
        render={({ field: { onChange, value } }) => {
          return (
            <OrganizationStructureSelect
              label={`${i18n.t('division:entity.role')}`}
              placeholder={`${i18n.t('general:select', { item: '' })}`}
              onChange={onChange}
              selected={value}
              type={DivisionType.ROLE}
            />
          );
        }}
      />
    </form>
  );
};

export default ActivityTypeForm;
