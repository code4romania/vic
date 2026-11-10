import React from 'react';
import { ReactNode } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Card from '../layouts/CardLayout';

interface StatisticsCardProps {
  label: string;
  // undefined while it loads: a gray placeholder instead of an empty card or a "0"
  value?: string;
  loading?: boolean;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
  info?: ReactNode;
  // a short gray line under the number ("evenimente planificate")
  subtitle?: ReactNode;
}

// A counter: label with an optional icon on top, the number, a short note and an optional link.
// On phones it is compact (two per row): smaller padding and number, and no link.
const StatisticsCard = ({
  label,
  value,
  loading,
  action,
  icon,
  info,
  subtitle,
}: StatisticsCardProps) => {
  const pending = loading || value === undefined;
  return (
    <Card>
      <div className="relative flex flex-col h-full p-4 sm:p-5 gap-2 sm:gap-3">
        {icon && <span className="absolute top-4 right-4 sm:top-5 sm:right-5">{icon}</span>}
        <p className="text-sm text-cool-gray-600 font-robotoMedium leading-5 pr-7">{label}</p>
        {pending ? (
          <span
            aria-busy="true"
            className="block h-8 sm:h-9 w-16 rounded-md bg-cool-gray-200 animate-pulse"
          />
        ) : (
          <p className="text-2xl sm:text-[2rem] leading-8 sm:leading-9 font-titilliumBold text-cool-gray-900">
            {value}
          </p>
        )}
        {subtitle && <span className="text-xs sm:text-sm text-cool-gray-600">{subtitle}</span>}
        {info && (
          <span className="text-xs sm:text-sm text-figure-amber font-robotoMedium">{info}</span>
        )}
        {action && (
          <button
            className="hidden sm:flex mt-auto pt-1 self-start items-center gap-1.5 text-sm font-robotoMedium text-navy hover:underline rounded-sm focus:outline-none focus-visible:shadow-focus"
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
