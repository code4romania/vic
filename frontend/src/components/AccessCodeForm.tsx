import React from 'react';
import { Control, Controller, DeepRequired, FieldErrorsImpl } from 'react-hook-form';
import i18n from '../common/config/i18n';
import DatePickerForm from './DatePickerForm';
import FormInput from './FormInput';

interface AccessCodeFormProps {
  control: Control<AccessCodeFormTypes, object>;
  errors: FieldErrorsImpl<DeepRequired<AccessCodeFormTypes>>;
}

export type AccessCodeFormTypes = {
  code: string;
  availabilityStart: Date;
  availabilityEnd?: Date;
};

const AccessCodeForm = ({ control, errors }: AccessCodeFormProps) => {
  return (
    <form className="space-y-6">
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
              />
            );
          }}
        />
        <Controller
          key="availabilityStart"
          name="availabilityStart"
          control={control}
          render={({ field: { onChange, value } }) => {
            return <DatePickerForm onChange={onChange} value={value} />;
          }}
        />
        <Controller
          key="availabilityEnd"
          name="availabilityEnd"
          control={control}
          render={({ field: { onChange, value } }) => {
            return <DatePickerForm onChange={onChange} value={value} />;
          }}
        />
      </div>
    </form>
  );
};

export default AccessCodeForm;
