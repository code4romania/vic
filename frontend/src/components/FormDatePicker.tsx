import React from 'react';
import DatePickerInput, { DatePickerInputProps } from './DatePickerInput';

interface FormDatePickerProps extends DatePickerInputProps {
  label?: string;
  error?: string;
  disabled?: boolean;
}

const FormDatePicker = ({
  label,
  placeholder,
  onChange,
  value,
  error,
  ...props
}: FormDatePickerProps) => {
  return (
    <div className="relative w-full">
      {label && <label htmlFor={props?.id}>{label}</label>}
      <div className="mt-1 rounded-md">
        <DatePickerInput
          {...props}
          onChange={onChange}
          placeholder={placeholder}
          value={value}
          aria-invalid={error ? 'true' : 'false'}
        />
        {error && (
          <div className="pr-3 flex items-center pointer-events-none">
            <p className="text-red-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormDatePicker;
