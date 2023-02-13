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
  disabled?: boolean;
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
          <div className="pr-3 flex items-center pointer-events-none">
            <p className="text-red-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePickerForm;
