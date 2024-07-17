import React from 'react';
import { classNames, formatDate } from '../common/utils/utils';
import DatePickerInput, { DatePickerInputProps } from './DatePickerInput';
import FormReadOnlyElement from './FormReadOnlyElement';

type FormDatePickerProps = Omit<DatePickerInputProps, 'placeholderText' | 'value' | 'selected'> & {
  label?: string;
  errorMessage?: string;
  placeholder?: string;
  value?: Date | null;
};

const FormDatePicker = ({
  placeholder,
  errorMessage,
  helper,
  readOnly,
  label,
  value,
  ...props
}: FormDatePickerProps) => {
  return readOnly ? (
    <FormReadOnlyElement label={label || ''} value={value ? formatDate(value) : '-'} />
  ) : (
    <DatePickerInput
      {...(props as DatePickerInputProps)}
      className={classNames(
        errorMessage
          ? 'border border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
          : '',
        errorMessage || '',
      )}
      selected={value}
      placeholderText={placeholder}
      aria-invalid={errorMessage ? 'true' : 'false'}
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
    />
  );
};

export default FormDatePicker;
