import React from 'react';
import { Control, Controller, DeepRequired, FieldErrorsImpl } from 'react-hook-form';
import i18n from '../common/config/i18n';
import { AnnouncementType } from '../common/enums/announcement-status.enum';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import Select from './Select';

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

// Title, description, type and volunteers needed, the display period, and (on create) whether
// it goes live right away. Laid out as in the design: two columns for the short fields.
const AnnouncementForm = ({ control, errors, isEditForm }: AnnouncementFormProps) => {
  return (
    <form className="flex flex-col gap-5" onSubmit={(event) => event.preventDefault()}>
      <Controller
        key="name"
        name="name"
        control={control}
        render={({ field: { onChange, value } }) => (
          <FormInput
            type="text"
            readOnly={false}
            value={value ?? ''}
            className="w-full max-w-full"
            errorMessage={errors.name?.message}
            label={`${i18n.t('announcement:form.name.label')}*`}
            placeholder={`${i18n.t('announcement:form.name.placeholder')}`}
            onChange={onChange}
            id="announcement-form__name"
          />
        )}
      />
      <Controller
        key="description"
        name="description"
        control={control}
        render={({ field: { onChange, value } }) => (
          <FormTextarea
            value={value ?? ''}
            onChange={onChange}
            errorMessage={errors.description?.message}
            label={`${i18n.t('announcement:form.description.label')}*`}
            placeholder={`${i18n.t('announcement:form.description.placeholder')}`}
            id="announcement-form__description"
          />
        )}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Controller
          key="type"
          name="type"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="flex flex-col gap-1">
              <Select<AnnouncementType>
                label={`${i18n.t('announcement:form.type.label')}*`}
                options={TypeOptions}
                selected={TypeOptions.find((option) => option.key === value)}
                onChange={(item) => item && onChange(item.key)}
              />
              {errors.type?.message && <p className="text-red-500">{errors.type.message}</p>}
            </div>
          )}
        />
        <Controller
          key="volunteersNeeded"
          name="volunteersNeeded"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormInput
              type="number"
              min={1}
              readOnly={false}
              value={value ?? ''}
              className="w-full"
              errorMessage={errors.volunteersNeeded?.message}
              label={`${i18n.t('announcement:form.volunteers_needed.label')}`}
              placeholder={`${i18n.t('announcement:form.volunteers_needed.placeholder')}`}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onChange(event.target.value === '' ? null : Number(event.target.value))
              }
              id="announcement-form__volunteers-needed"
            />
          )}
        />
        <Controller
          key="displayStartDate"
          name="displayStartDate"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormDatePicker
              name="displayStartDate"
              label={`${i18n.t('announcement:form.display_start_date.label')}*`}
              onChange={onChange}
              value={value}
              errorMessage={errors.displayStartDate?.message}
            />
          )}
        />
        <Controller
          key="displayEndDate"
          name="displayEndDate"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormDatePicker
              name="displayEndDate"
              label={`${i18n.t('announcement:form.display_end_date.label')}`}
              onChange={onChange}
              value={value || undefined}
              errorMessage={errors.displayEndDate?.message}
            />
          )}
        />
      </div>
      {!isEditForm && (
        <Controller
          key="publishNow"
          name="publishNow"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="announcement-form__publish-now"
                className="h-4 w-4 p-0 rounded border-cool-gray-300 text-navy focus:ring-navy"
                checked={!!value}
                onChange={(event) => onChange(event.target.checked)}
              />
              <label htmlFor="announcement-form__publish-now" className="text-sm">
                {i18n.t('announcement:form.publish_now.label')}
              </label>
            </div>
          )}
        />
      )}
    </form>
  );
};

export default AnnouncementForm;
