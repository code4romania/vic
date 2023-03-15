import React from 'react';
import { Control, Controller, DeepRequired, FieldErrorsImpl } from 'react-hook-form';
import i18n from '../common/config/i18n';
import { AnnouncementStatus } from '../common/enums/announcement-status.enum';
import TargetsMultiSelect from '../containers/TargetsMultiSelect';
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
  status?: AnnouncementStatus;
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
                placeholder={`${i18n.t('announcement:form.name.placeholder')}`}
                onChange={onChange}
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
                placeholder={`${i18n.t('announcement:form.description.placeholder')}`}
                id="announcement-form__description"
              />
            );
          }}
        />
        <Controller
          key="targets"
          name="targets"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <TargetsMultiSelect
                label={`${i18n.t('announcement:form.target.label')}`}
                placeholder={`${i18n.t('announcement:form.target.placeholder')}`}
                onChange={onChange}
                selected={value}
                helper={
                  errors.targets?.message ? (
                    <p className="text-red-500">{errors.targets?.message}</p>
                  ) : (
                    i18n.t('announcement:form.target.disclaimer')
                  )
                }
              />
            );
          }}
        />
      </form>
    </FormLayout>
  );
};

export default AnnouncementForm;
