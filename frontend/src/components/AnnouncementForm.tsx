import React from 'react';
import { Control, Controller, DeepRequired, FieldErrorsImpl } from 'react-hook-form';
import i18n from '../common/config/i18n';
import { AnnouncementType } from '../common/enums/announcement-status.enum';
import FormLayout from '../layouts/FormLayout';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';
import FormRadioGroup from './FormRadioGroup';
import FormTextarea from './FormTextarea';

interface AnnouncementFormProps {
  control: Control<AnnouncementFormTypes, object>;
  errors: FieldErrorsImpl<DeepRequired<AnnouncementFormTypes>>;
  // "publish now" only makes sense when creating
  isEditForm?: boolean;
}

export type AnnouncementFormTypes = {
  name: string;
  description: string;
  type: AnnouncementType;
  volunteersNeeded?: number | null;
  displayStartDate: Date;
  displayEndDate?: Date | null;
  publishNow?: boolean;
};

const TypeOptions = [
  { key: AnnouncementType.RECRUITMENT, value: i18n.t('announcement:type.recruitment') },
  { key: AnnouncementType.ACTIVITY, value: i18n.t('announcement:type.activity') },
];

const AnnouncementForm = ({ control, errors, isEditForm }: AnnouncementFormProps) => {
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
          key="type"
          name="type"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormRadioGroup
                name="type"
                readOnly={false}
                options={TypeOptions}
                value={value}
                errorMessage={errors.type?.message}
                label={`${i18n.t('announcement:form.type.label')}`}
                onChange={onChange}
                defaultValue={value}
              />
            );
          }}
        />
        <Controller
          key="volunteersNeeded"
          name="volunteersNeeded"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormInput
                type="number"
                min={1}
                readOnly={false}
                value={value ?? ''}
                errorMessage={errors.volunteersNeeded?.message}
                label={`${i18n.t('announcement:form.volunteers_needed.label')}`}
                placeholder={`${i18n.t('announcement:form.volunteers_needed.placeholder')}`}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  onChange(event.target.value === '' ? null : Number(event.target.value))
                }
                id="announcement-form__volunteers-needed"
              />
            );
          }}
        />
        <Controller
          key="displayStartDate"
          name="displayStartDate"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormDatePicker
                name="displayStartDate"
                label={`${i18n.t('announcement:form.display_start_date.label')}*`}
                onChange={onChange}
                value={value}
                errorMessage={errors.displayStartDate?.message}
              />
            );
          }}
        />
        <Controller
          key="displayEndDate"
          name="displayEndDate"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormDatePicker
                name="displayEndDate"
                label={`${i18n.t('announcement:form.display_end_date.label')}`}
                onChange={onChange}
                value={value || undefined}
                errorMessage={errors.displayEndDate?.message}
              />
            );
          }}
        />
        {!isEditForm && (
          <Controller
            key="publishNow"
            name="publishNow"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="announcement-form__publish-now"
                    checked={!!value}
                    onChange={(event) => onChange(event.target.checked)}
                  />
                  <label htmlFor="announcement-form__publish-now">
                    {i18n.t('announcement:form.publish_now.label')}
                  </label>
                </div>
              );
            }}
          />
        )}
      </form>
    </FormLayout>
  );
};

export default AnnouncementForm;
