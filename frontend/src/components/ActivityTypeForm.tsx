import React from 'react';
import { Control, Controller, DeepRequired, FieldErrorsImpl } from 'react-hook-form';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import FormInput from './FormInput';
import Select, { SelectItem } from './Select';

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
    <FormLayout>
      <form className="max-w-[30rem]">
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
                label={i18n.t('activity_types:form.name.label')}
                placeholder={`${i18n.t('activity_types:form.name.placeholder')}`}
                onChange={onChange}
                aria-invalid={errors['name']?.message ? 'true' : 'false'}
                id="add-activity-form__name"
              />
            );
          }}
        />
        <Controller
          key="icon"
          name="icon"
          control={control}
          defaultValue="logo.svg"
          render={({ field: { onChange, value } }) => {
            return (
              <FormInput
                type="text"
                value={value}
                errorMessage={errors['icon']?.message as string}
                label={i18n.t('general:choose', {
                  item: i18n.t('general:image').toLowerCase(),
                })}
                onChange={onChange}
                aria-invalid={errors['icon']?.message ? 'true' : 'false'}
                id="add-activity-form__icon"
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
              <div className="flex flex-col gap-1">
                <Select
                  label={`${i18n.t('division:entity.branch')}`}
                  placeholder={`${i18n.t('general:select', { item: '' })}`}
                  onChange={onChange}
                  defaultValue={value}
                  options={[
                    { value: 'Otelul', key: 'otelul' },
                    { value: 'Galati', key: 'galati' },
                    { value: 'Carpati', key: 'carpati' },
                  ]}
                />
              </div>
            );
          }}
        />
        <Controller
          name="department"
          key="department"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <div className="flex flex-col gap-1">
                <Select
                  label={`${i18n.t('division:entity.department')}`}
                  placeholder={`${i18n.t('general:select', { item: '' })}`}
                  onChange={onChange}
                  defaultValue={value}
                  options={[
                    { value: 'Caine', key: 'caine' },
                    { value: 'Dog', key: 'dog' },
                    { value: 'Hot Dog', key: 'hot' },
                  ]}
                />
              </div>
            );
          }}
        />
        <Controller
          name="role"
          key="role"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <div className="flex flex-col gap-1">
                <Select
                  label={`${i18n.t('division:entity.role')}`}
                  placeholder={`${i18n.t('general:select', { item: '' })}`}
                  onChange={onChange}
                  defaultValue={value}
                  options={[
                    { value: 'Alba', key: 'alba' },
                    { value: 'Zapada', key: 'zapada' },
                    { value: 'Scufita', key: 'scufita' },
                  ]}
                />
              </div>
            );
          }}
        />
      </form>
    </FormLayout>
  );
};

export default ActivityTypeForm;
