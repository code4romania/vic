import React from 'react';
import { ReactNode } from 'react';
import i18n from '../common/config/i18n';

interface StatisticsCardProps {
  label: string;
  value?: string;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
  info?: ReactNode;
}

const StatisticsCard = ({ label, value, action, icon, info }: StatisticsCardProps) => {
  return (
    <div className="rounded-lg shadow-section bg-white max-w-full min-w-fit grow">
      <div className="flex sm:gap-5 gap-2 sm:p-6 p-3 items-center">
        {icon}
        <div className="flex flex-col gap-2 shrink-[80]">
          <p className="text-cool-gray-500 leading-5">{label}</p>
          {value && label && (
            <div className="flex flex-wrap gap-2 items-end">
              <p className="text-4xl leading-8 font-semibold ">{value}</p>
              <span className="bg-yellow-200 h-7 leading-7 rounded-xl px-2.5 whitespace-nowrap">
                {info}
              </span>
            </div>
          )}
          {(!value || !label) && (
            <span className="flex items-center text-center sm:text-sm lg:text-base text-xs h-8">
              {i18n.t('general:error.load_entries')}
            </span>
          )}
        </div>
      </div>
      {action && (
        <button
          className="p-4 text-base leading-5 w-full bg-cool-gray-100 text-left hover:bg-cool-gray-200"
          onClick={action.onClick}
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default StatisticsCard;
