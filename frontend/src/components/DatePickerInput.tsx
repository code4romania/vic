import React, { SyntheticEvent } from 'react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
//TODO: extends DatePickerInputProps with DatePicker props
export interface DatePickerInputProps {
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  minDate?: Date;
  maxDate?: Date;
  onChange: (date: Date | null, event: SyntheticEvent<Date, Event> | undefined) => void;
  value?: Date;
  id?: string;
  dateFormat?: string;
  showTimeSelect?: boolean;
  timeIntervals?: number;
  timeFormat?: string;
}

const DatePickerInput = ({
  placeholder,
  onChange,
  value,
  id,
  dateFormat,
  ...props
}: DatePickerInputProps) => {
  return (
    <DatePicker
      {...props}
      className="block w-full pr-10 border-cool-gray-300 shadow-sm rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 sm:text-sm lg:text-base text-xs leading-loose"
      onChange={onChange}
      dateFormat={dateFormat ? dateFormat : 'dd.MM.yyyy'}
      selected={value}
      placeholderText={placeholder}
      id={id}
    />
  );
};

export default DatePickerInput;
