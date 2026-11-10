import React from 'react';
import { ReactNode } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Card from '../layouts/CardLayout';

interface StatisticsCardProps {
  label: string;
  value: string;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
  info?: ReactNode;
}

// A counter: label with an optional icon on top, the number, a short note and an optional link.
const StatisticsCard = ({ label, value, action, icon, info }: StatisticsCardProps) => {
  return (
    <Card>
      <div className="relative flex flex-col h-full p-5 gap-3">
        {icon && <span className="absolute top-5 right-5">{icon}</span>}
        <p className="text-sm text-cool-gray-600 font-robotoMedium leading-5 pr-8">{label}</p>
        <p className="text-[2rem] leading-9 font-titilliumBold text-cool-gray-900">{value}</p>
        {info && <span className="text-sm text-figure-amber font-robotoMedium">{info}</span>}
        {action && (
          <button
            className="mt-auto pt-1 self-start flex items-center gap-1.5 text-sm font-robotoMedium text-navy hover:underline"
            onClick={action.onClick}
            aria-label={action.label}
          >
            {action.label}
            <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </Card>
  );
};

export default StatisticsCard;
