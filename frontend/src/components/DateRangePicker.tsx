import { CalendarIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import i18n from '../common/config/i18n';

interface DateRangePickerProps {
  id?: string;
  label: string;
  value?: Date[];
  onChange?: (range: Date[]) => void;
}

const DateRangePicker = ({ label, value, onChange, id }: DateRangePickerProps) => {
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    if (value) {
      setDateRange(value);
    } else [setDateRange([])];
  }, [value]);

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      onChange && onChange(dateRange);
    }
  }, [dateRange]);

  const onChangeDate = (update: Date[] | unknown) => {
    setDateRange(update as Date[]);
  };

  return (
    <div className="flex gap-1 flex-col relative w-full">
      {label && <label htmlFor={`${id}__date-picker`}>{label}</label>}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none z-10">
          <CalendarIcon
            className="-ml-1 mr-2 sm:h-5 sm:w-5 h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <DatePicker
          className="block w-full pr-10 border-cool-gray-200 shadow-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm lg:text-base text-xs leading-loose max-w-[37rem]"
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={onChangeDate}
          isClearable={false}
          placeholderText={i18n.t('general:select_interval').toString()}
          id={`${id}__date-picker`}
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
