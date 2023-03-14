import React from 'react';

interface MediaCellProps {
  logo: string;
  title: string;
  subtitle?: string;
}

const MediaCell = ({ logo, title, subtitle }: MediaCellProps) => (
  <div className="flex items-center gap-3 shrink-0 w-full">
    <img src={logo} className="w-10 h-10 logo text-transparent" alt={`${title} picture`} />
    <div className="flex flex-col w-4/5">
      <small className="font-robotoBold truncate ">{title}</small>
      <small className="truncate text-cool-gray-500">{subtitle || ''}</small>
    </div>
  </div>
);

export default MediaCell;
