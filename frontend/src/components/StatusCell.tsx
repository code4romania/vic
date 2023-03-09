import React from 'react';
import i18n from '../common/config/i18n';
import { EventStatus } from '../common/enums/event-status';
import { classNames } from '../common/utils/utils';

const MapColors = {
  [EventStatus.DRAFT]: 'bg-yellow-500',
  [EventStatus.PUBLISHED]: 'bg-green-500',
  [EventStatus.ARCHIVED]: 'bg-red-500',
};

interface StatusCellProps {
  status: EventStatus;
}

const StatusCell = ({ status }: StatusCellProps) => (
  <div className="flex items-center gap-1">
    <div className={classNames(MapColors[status], 'w-2 h-2 rounded-full')}></div>
    <small className="truncate">{i18n.t(`events:display_status.${status}`)}</small>
  </div>
);

export default StatusCell;
