import React, { useEffect } from 'react';
import { Control, Controller, DeepRequired, FieldErrorsImpl, UseFormReset } from 'react-hook-form';
import i18n from '../common/config/i18n';
import { IAccessCode } from '../pages/AccesCodes';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';

interface AccessCodeFormProps {
  control: Control<AccessCodeFormTypes, object>;
  errors: FieldErrorsImpl<DeepRequired<AccessCodeFormTypes>>;
  disabled?: boolean;
  accessCode?: IAccessCode;
  reset?: UseFormReset<AccessCodeFormTypes>;
}

export type AccessCodeFormTypes = {
  code: string;
  startDate: Date;
  endDate?: Date;
};

const AccessCodeForm = ({ control, errors, disabled, accessCode, reset }: AccessCodeFormProps) => {
  useEffect(() => {
    if (accessCode && reset) reset(accessCode);
  }, [accessCode, reset]);

  return (
    <form className="py-6 text">
      <div className="flex flex-col gap-4 justify-center">
        <h3>{i18n.t('access_codes:form.title')}</h3>
        <p className="text-cool-gray-500">{i18n.t('access_codes:form.description')}</p>
        <Controller
          key="code"
          name="code"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormInput
                type="text"
                readOnly={false}
                value={value}
                errorMessage={errors['code']?.message}
                label={`${i18n.t('access_codes:name')}*`}
                onChange={onChange}
                aria-invalid={errors['code']?.message ? 'true' : 'false'}
                id="access-code-form__code"
                disabled={disabled}
              />
            );
          }}
        />
        <Controller
          key="startDate"
          name="startDate"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormDatePicker
                name="startDate"
                label={i18n.t('access_codes:form.start_date') as string}
                onChange={onChange}
                value={value}
                error={errors['startDate']?.message}
                disabled={disabled}
              />
            );
          }}
        />
        <Controller
          key="endDate"
          name="endDate"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormDatePicker
                name="endDate"
                label={i18n.t('access_codes:form.end_date') as string}
                onChange={onChange}
                value={value}
                error={errors['endDate']?.message}
              />
            );
          }}
        />
      </div>
    </form>
  );
};

export default AccessCodeForm;
