import React, { useEffect } from 'react';
import { Control, Controller, DeepRequired, FieldErrorsImpl, UseFormReset } from 'react-hook-form';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import { IAccessCode } from '../pages/AccesCodes';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';
import Paragraph from './Paragraph';

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
  endDate?: Date | null;
};

const AccessCodeForm = ({ control, errors, disabled, accessCode, reset }: AccessCodeFormProps) => {
  useEffect(() => {
    if (accessCode && reset)
      reset({
        ...accessCode,
        startDate: new Date(accessCode.startDate),
        endDate: accessCode.endDate ? new Date(accessCode.endDate) : accessCode.endDate,
      });
  }, [accessCode, reset]);

  return (
    <FormLayout>
      <Paragraph title={i18n.t('access_code:title')}>{i18n.t('access_code:description')}</Paragraph>
      <form>
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
                label={`${i18n.t('access_code:name')}*`}
                onChange={onChange}
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
                label={i18n.t('access_code:start_date') as string}
                onChange={onChange}
                value={value}
                errorMessage={errors['startDate']?.message}
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
                label={i18n.t('access_code:end_date') as string}
                onChange={onChange}
                value={value as Date}
                errorMessage={errors['endDate']?.message}
              />
            );
          }}
        />
      </form>
    </FormLayout>
  );
};

export default AccessCodeForm;
