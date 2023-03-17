import { PhotoIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface MediaCellProps {
  logo?: string;
  title: string;
  subtitle?: string;
}

const MediaCell = ({ logo, title, subtitle }: MediaCellProps) => (
  <div className="flex items-center gap-3 shrink-0 w-full">
    {logo ? (
      <img
        src={logo}
        className="w-10 h-10 logo text-transparent shrink-0"
        alt={`${title} picture`}
      />
    ) : (
      <div className="w-10 h-10 rounded-full bg-cool-gray-100 grid place-items-center shrink-0">
        <PhotoIcon className="h-6 w-6 text-gray-500" />
      </div>
    )}
    <div className="flex flex-col w-4/5">
      <small className="font-robotoBold truncate ">{title}</small>
      <small className="truncate text-cool-gray-500">{subtitle || ''}</small>
    </div>
  </div>
);

export default MediaCell;
