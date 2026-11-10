import React from 'react';
import InitialsAvatar from './InitialsAvatar';

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
      <InitialsAvatar name={title} />
    )}
    {/* long names wrap on two lines; the full name is in the tooltip */}
    <div className="flex flex-col min-w-0 flex-1">
      <small className="font-robotoMedium text-cool-gray-900 line-clamp-2" title={title}>
        {title}
      </small>
      <small className="truncate text-cool-gray-500" title={subtitle}>
        {subtitle || ''}
      </small>
    </div>
  </div>
);

export default MediaCell;
