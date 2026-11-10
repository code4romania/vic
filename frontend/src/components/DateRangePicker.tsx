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
          <CalendarIcon className="-ml-1 mr-2 h-5 w-5 text-cool-gray-500" aria-hidden="true" />
        </div>

        <DatePicker
          wrapperClassName="w-full"
          className="block w-full h-[42px] pr-10 border-cool-gray-300 rounded-lg focus:ring-navy focus:border-navy text-base sm:text-sm max-w-[37rem] py-2 pl-3"
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
