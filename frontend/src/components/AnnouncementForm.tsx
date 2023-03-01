import React from 'react';
import { Control, Controller, DeepRequired, FieldErrorsImpl } from 'react-hook-form';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import { SelectItem } from './Select';

interface AnnouncementFormProps {
  control: Control<AnnouncementFormTypes, object>;
  errors: FieldErrorsImpl<DeepRequired<AnnouncementFormTypes>>;
}

export type AnnouncementFormTypes = {
  name: string;
  description: string;
  targets: SelectItem<string>[];
};

const AnnouncementForm = ({ control, errors }: AnnouncementFormProps) => {
  return (
    <FormLayout>
      <form>
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
                errorMessage={errors.name?.message}
                label={`${i18n.t('announcement:header.name')}`}
                onChange={onChange}
                aria-invalid={errors.name?.message ? 'true' : 'false'}
                id="announcement-form__name"
              />
            );
          }}
        />
        <Controller
          key="description"
          name="description"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormTextarea
                defaultValue={value}
                onChange={onChange}
                errorMessage={errors.description?.message}
                label={`${i18n.t('announcement:form.description.label')}`}
              />
            );
          }}
        />
      </form>
    </FormLayout>
  );
};

export default AnnouncementForm;
