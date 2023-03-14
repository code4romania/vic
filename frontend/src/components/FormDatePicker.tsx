import React from 'react';
import { classNames, formatDate } from '../common/utils/utils';
import DatePickerInput, { DatePickerInputProps } from './DatePickerInput';
import FormReadOnlyElement from './FormReadOnlyElement';

interface FormDatePickerProps extends DatePickerInputProps {
  label?: string;
  errorMessage?: string;
  disabled?: boolean;
}

const FormDatePicker = ({
  placeholder,
  onChange,
  value,
  errorMessage,
  helper,
  readOnly,
  label,
  ...props
}: FormDatePickerProps) => {
  return readOnly ? (
    <FormReadOnlyElement label={label || ''} value={value ? formatDate(value) : '-'} />
  ) : (
    <DatePickerInput
      {...props}
      className={classNames(
        errorMessage
          ? 'border border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
          : '',
        errorMessage || '',
      )}
      label={label}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
      aria-invalid={errorMessage ? 'true' : 'false'}
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
    />
  );
};

export default FormDatePicker;
