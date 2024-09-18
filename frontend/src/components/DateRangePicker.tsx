import { CalendarIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import i18n from '../common/config/i18n';

interface DateRangePickerProps {
  id?: string;
  label: string;
  value?: [Date | null, Date | null];
  minDate?: Date | undefined;
  onChange?: (range: [Date | null, Date | null]) => void;
  disabled?: boolean;
  className?: string;
  errorMessage?: string;
}

const DateRangePicker = ({
  label,
  value,
  minDate,
  onChange,
  id,
  disabled,
  className,
  errorMessage,
}: DateRangePickerProps) => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(value || [null, null]);

  useEffect(() => {
    // Update internal state when value prop changes, including when it's reset to undefined
    if (value === undefined) {
      setDateRange([null, null]);
    } else if (value && (value[0] !== dateRange[0] || value[1] !== dateRange[1])) {
      setDateRange(value);
    }
  }, [value]);

  const onChangeDate = (update: [Date | null, Date | null] | unknown) => {
    const newDateRange = update as [Date | null, Date | null];
    setDateRange(newDateRange);
    onChange && onChange(newDateRange);
  };

  return (
    <div className={`flex gap-1 flex-col relative w-full ${className}`}>
      {label && <label htmlFor={`${id}__date-picker`}>{label}</label>}

      <div className="relative max-w-[37rem]">
        <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none z-10">
          <CalendarIcon
            className="-ml-1 mr-2 sm:h-5 sm:w-5 h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
        </div>

        <DatePicker
          wrapperClassName="w-full"
          className="block w-full pr-10 border-cool-gray-200 shadow-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm lg:text-base text-xs leading-loose max-w-[37rem] py-2 pl-3"
          selectsRange={true}
          startDate={dateRange[0] ? dateRange[0] : undefined}
          endDate={dateRange[1] ? dateRange[1] : undefined}
          onChange={onChangeDate}
          isClearable={false}
          placeholderText={i18n.t('general:select_interval').toString()}
          id={`${id}__date-picker`}
          disabled={disabled}
          dateFormat="dd.MM.yyyy"
          minDate={minDate}
          autoComplete="off"
        />
      </div>
      <p className="text-red-500">{errorMessage}</p>
    </div>
  );
};

export default DateRangePicker;
