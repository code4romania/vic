import React from 'react';
import i18n from '../common/config/i18n';
import { classNames } from '../common/utils/utils';

const MapColors = {
  draft: 'bg-yellow-500',
  published: 'bg-green-500',
  archived: 'bg-red-500',
};

interface MediaCellProps {
  status: 'draft' | 'published' | 'archived';
}

const MediaStatusCell = ({ status }: MediaCellProps) => (
  <div className="flex items-center gap-1">
    <div className={classNames(MapColors[status], 'w-2 h-2 rounded-full')}></div>
    <small className="truncate">{i18n.t(`events:display_status.${status}`)}</small>
  </div>
);

export default MediaStatusCell;
