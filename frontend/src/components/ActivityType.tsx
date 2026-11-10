import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import i18n from '../common/config/i18n';
import { ActivityTypeStatus } from '../common/enums/activity-type-status.enum';
import { IActivityType } from '../common/interfaces/activity-type.interface';
import { IMAGE_OPTIONS } from './ImagePicker';
import StatusBadge from './StatusBadge';

interface ActivityTypeProps {
  activityType: IActivityType;
  onClick: (id: string) => void;
}

// One activity category: its icon, name, status and the structure it belongs to. Opens the edit page.
const ActivityType = ({ activityType, onClick }: ActivityTypeProps) => {
  const icon =
    IMAGE_OPTIONS.find((option) => option.key === activityType.icon)?.component ??
    IMAGE_OPTIONS[0].component;
  const archived = activityType.status === ActivityTypeStatus.ARCHIVED;
  const structure = [activityType.branch, activityType.department, activityType.role]
    .filter((division) => !!division?.name)
    .map((division) => division.name);

  return (
    <button
      type="button"
      id={`activity-type__${activityType.id}`}
      className="group w-full text-left rounded-lg border border-cool-gray-200 bg-white px-4 py-3 flex gap-3 items-center hover:border-cool-gray-300 hover:bg-cool-gray-50"
      onClick={() => onClick(activityType.id)}
    >
      <div className="h-11 w-11 grid place-items-center rounded-full bg-cool-gray-100 shrink-0">
        {icon}
      </div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="font-robotoMedium text-cool-gray-900 break-words">
          {activityType.name}
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          <StatusBadge tone={archived ? 'gray' : 'green'}>
            {i18n.t(`activity_types:status.${archived ? 'archived' : 'active'}`)}
          </StatusBadge>
          <span className="text-xs text-cool-gray-500 truncate">
            {structure.length ? structure.join(' · ') : i18n.t('activity_types:all_structure')}
          </span>
        </span>
      </div>
      <ChevronRightIcon
        className="h-5 w-5 text-cool-gray-400 shrink-0 group-hover:text-cool-gray-600"
        aria-hidden="true"
      />
    </button>
  );
};

export default ActivityType;
