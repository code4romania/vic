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
  return (
    <div className="flex gap-1 flex-col max-w-[37rem]">
      {label && <label htmlFor={`${label}__datepicker`}>{label}</label>}
      <div className="relative">
        <CalendarIcon
          className="sm:h-5 sm:w-5 h-4 w-4 text-gray-400 absolute z-10 mt-2.5 right-2"
          aria-hidden="true"
        />
        <DatePicker
          {...datePickerProps}
          wrapperClassName="w-full"
          className={classNames(
            className || '',
            'block w-full border-cool-gray-200 shadow-sm rounded-md sm:text-sm lg:text-base text-xs leading-loose max-h-[42px]',
          )}
          dateFormat={dateFormat}
        />
      </div>
      {helper}
    </div>
  );
};

export default DatePickerInput;
