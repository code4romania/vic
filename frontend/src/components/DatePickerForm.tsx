import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import React, { SyntheticEvent } from 'react';
import DatePickerInput from './DatePickerInput';

interface DatePickerFormProps {
  label?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  minDate?: Date;
  maxDate?: Date;
  error?: string;
  onChange: (date: Date | null, event: SyntheticEvent<Date, Event> | undefined) => void;
  value?: Date;
  id?: string;
}

const DatePickerForm = ({
  label,
  placeholder,
  onChange,
  value,
  error,
  ...props
}: DatePickerFormProps) => {
  return (
    <div className="relative w-full">
      {label && <label htmlFor={props?.id}>{label}</label>}
      <div className="mt-1 rounded-md">
        <DatePickerInput onChange={onChange} placeholder={placeholder} value={value} {...props} />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePickerForm;
