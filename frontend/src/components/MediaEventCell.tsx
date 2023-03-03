import React from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface MediaEventCellProps {
  logo?: string;
  title: string;
  subtitle?: string;
}

const MediaEventCell = ({ logo, title }: MediaEventCellProps) => (
  <div className="flex items-center gap-3 shrink-0 w-full">
    {logo ? (
      <img src={logo} className="w-10 h-10 logo text-transparent" alt={`${title} picture`} />
    ) : (
      <div className="w-10 h-10 rounded-full bg-cool-gray-100 grid place-items-center shrink-0">
        <CalendarIcon className="h-6 w-6 text-gray-500" />
      </div>
    )}
    <div className="flex flex-col w-4/5">
      <small className="font-robotoBold truncate">{title}</small>
    </div>
  </div>
);

export default MediaEventCell;
