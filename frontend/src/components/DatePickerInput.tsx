import React, { ComponentPropsWithoutRef, ReactNode, SyntheticEvent } from 'react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import { classNames } from '../common/utils/utils';
//TODO: extends DatePickerInputProps with DatePicker props
export interface DatePickerInputProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'onChange' | 'value' | 'onSelect'> {
  minDate?: Date;
  maxDate?: Date;
  onChange: (date: Date | null, event: SyntheticEvent<Date, Event> | undefined) => void;
  value?: Date;
  dateFormat?: string;
  showTimeSelect?: boolean;
  timeIntervals?: number;
  timeFormat?: string;
  helper?: ReactNode;
  label?: string;
}

const DatePickerInput = ({
  placeholder,
  onChange,
  value,
  id,
  dateFormat,
  className,
  helper,
  label,
  ...props
}: DatePickerInputProps) => {
  return (
    <div className="flex gap-1 flex-col">
      {label && <label htmlFor={`${label}__datepicker`}>{label}</label>}
      <DatePicker
        {...props}
        className={classNames(
          className || '',
          'block w-full pr-10 border-cool-gray-300 shadow-sm rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 sm:text-sm lg:text-base text-xs leading-loose',
        )}
        onChange={onChange}
        dateFormat={dateFormat ? dateFormat : 'dd.MM.yyyy'}
        selected={value}
        placeholderText={placeholder}
        id={id}
      />
      {helper}
    </div>
  );
};

export default DatePickerInput;
