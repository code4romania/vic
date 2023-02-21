import React from 'react';
import { ChevronRightIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { CategoryStatus } from '../pages/ActivityCategories';
import i18n from '../common/config/i18n';

interface ActivityButtonProps {
  key: string;
  icon: string;
  id: string;
  name: string;
  status: CategoryStatus;
  onClick: (id: string) => void;
}

const ActivityButton = ({ icon, id, name, onClick, status }: ActivityButtonProps) => {
  const handleClick = () => {
    onClick(id);
  };

  return (
    <div
      key={id}
      className={`border border-cool-gray-300 rounded-md px-4 py-2 flex gap-1 lg:gap-4 items-center min-w-fit max-w-full cursor-pointer`}
      onClick={handleClick}
    >
      <div className="h-12 w-12 grid place-items-center rounded-full bg-cool-gray-100 shrink-0">
        <img src={icon} className="w-6 h-6" alt={`${name} activ ity icon`} />
      </div>
      <div className="flex gap-1 items-center">
        <p className="text-left">{name}</p>
        {status === CategoryStatus.DISABLED && (
          <ExclamationCircleIcon
            className="h-6 w-6 text-red-500 shrink-0"
            title={`${i18n.t('activity_categories:info')}`}
          />
        )}
      </div>
      <ChevronRightIcon className="h-5 w-5 text-cool-gray-400 shrink-0 ml-auto" />
    </div>
  );
};

export default ActivityButton;
