import React from 'react';
import { ReactNode } from 'react';
import Card from '../layouts/CardLayout';
import LoadingContent from './LoadingContent';

interface StatisticsCardProps {
  label: string;
  value: string;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
  info?: ReactNode;
  className?: string;
  isLoading?: boolean;
}

const StatisticsCard = ({ label, value, action, icon, info, className, isLoading }: StatisticsCardProps) => {
  return (
    <Card className={className}>
      <div className="flex flex-col">
        <div className="flex sm:gap-5 gap-2 sm:p-6 p-3 items-center">
          {icon}
          <div className="flex flex-col gap-2 shrink-[80]">
            <p className="text-cool-gray-500 leading-5">{label}</p>
            <div className="flex flex-wrap gap-2 items-end">
              {isLoading ? <LoadingContent /> : <p className="text-4xl leading-8 font-semibold ">{value}</p>}
              {info && (
                <span className="bg-yellow-200 h-7 leading-7 rounded-xl px-2.5 whitespace-nowrap">
                  {info}
                </span>
              )}
            </div>
          </div>
        </div>
        {action && (
          <button
            className="p-4 text-base leading-5 w-full bg-cool-gray-100 text-left hover:bg-cool-gray-200 rounded-b-lg"
            onClick={action.onClick}
            aria-label={action.label}
          >
            {action.label}
          </button>
        )}
      </div>
    </Card>
  );
};

export default StatisticsCard;
