import React, { ReactNode } from 'react';
import DatePicker, { DatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { classNames } from '../common/utils/utils';

export type DatePickerInputProps = DatePickerProps & {
  label?: string;
  helperText?: string;
  helper?: ReactNode;
};

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  helper,
  className,
  dateFormat = 'dd.MM.yyyy',
  ...datePickerProps
}) => {
  // the label points at the input, also when the caller passes its own id
  const inputId = datePickerProps.id ?? (label ? `${label}__datepicker` : undefined);
  return (
    <div className="flex gap-1 flex-col max-w-[37rem]">
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className="relative">
        <DatePicker
          {...datePickerProps}
          id={inputId}
          wrapperClassName="w-full"
          className={classNames(
            className || '',
            'block w-full border-cool-gray-300 rounded-lg text-base sm:text-sm h-[42px]',
          )}
          dateFormat={dateFormat}
        />
        <CalendarIcon
          className="sm:h-5 sm:w-5 h-4 w-4 text-cool-gray-500 absolute mt-[-2rem] right-2"
          aria-hidden="true"
        />
      </div>
      {helper}
    </div>
  );
};

export default DatePickerInput;
