import React from 'react';

interface MediaCellProps {
  logo: string;
  title: string;
  subtitle?: string;
}

const MediaCell = ({ logo, title, subtitle }: MediaCellProps) => (
  <div className="flex items-center gap-3 shrink-0">
    <img src={logo} className="w-10 h-10 logo" alt={`${title} picture`} />
    <div className="flex flex-col max-w-[5rem] lg:max-w-[6rem] xl:max-w-[10rem] 2xl:max-w-[15rem]">
      <small className="font-robotoBold truncate ">{title}</small>
      <small className="truncate text-cool-gray-500">{subtitle || ''}</small>
    </div>
  </div>
);

export default MediaCell;
