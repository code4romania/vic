import React from 'react';

interface MediaCellProps {
  logo: string;
  name: string;
}

const MediaCell = ({ logo, name }: MediaCellProps) => (
  <div className="flex items-center gap-3 shrink-0">
    <img src={logo} className="w-10 h-10 logo" alt={`${name} picture`} />
    <small className="font-robotoBold truncate max-w-[5rem] lg:max-w-[6rem] xl:max-w-[10rem] 2xl:max-w-[15rem]">
      {name}
    </small>
  </div>
);

export default MediaCell;
