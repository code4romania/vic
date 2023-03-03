import React from 'react';
import {
  Control,
  Controller,
  DeepRequired,
  FieldErrorsImpl,
  UseFormResetField,
  UseFormWatch,
} from 'react-hook-form';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import MultiSelect, { IMultiListItem } from './MultiSelect';

interface AnnouncementFormProps {
  options?: IMultiListItem[];
  control: Control<AnnouncementFormTypes, object>;
  errors: FieldErrorsImpl<DeepRequired<AnnouncementFormTypes>>;
  resetField: UseFormResetField<AnnouncementFormTypes>;
  watch: UseFormWatch<AnnouncementFormTypes>;
}

export type AnnouncementFormTypes = {
  name: string;
  description: string;
  targets: IMultiListItem[];
  isAllOrganization?: boolean;
};

const AnnouncementForm = ({
  options,
  control,
  errors,
  resetField,
  watch,
}: AnnouncementFormProps) => {
  const isAllOrganization = watch('isAllOrganization');

  React.useEffect(() => {
    if (isAllOrganization) resetField('targets');
  }, [isAllOrganization]);

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
                placeholder={`${i18n.t('announcement:form.description.placeholder')}`}
              />
            );
          }}
        />
        <div className="flex flex-col gap-1">
          <label>{i18n.t('announcement:header.target')}</label>
          {!isAllOrganization && (
            <Controller
              key="targets"
              name="targets"
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <MultiSelect
                    options={options}
                    placeholder={`${i18n.t('announcement:form.target.placeholder')}`}
                    value={value || []}
                    onChange={onChange}
                  />
                );
              }}
            />
          )}
          <Controller
            key="isAllOrganization"
            name="isAllOrganization"
            control={control}
            render={({ field: { onChange } }) => {
              return (
                <div className="flex flex-row gap-3">
                  <input
                    className="self-center rounded-[4px] border-cool-gray-300"
                    type="checkbox"
                    checked={isAllOrganization}
                    onChange={onChange}
                  />
                  <label>{i18n.t('announcement:all_organization')}</label>
                </div>
              );
            }}
          />
        </div>
      </form>
    </FormLayout>
  );
};

export default AnnouncementForm;
