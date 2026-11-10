import React, { ReactNode } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { classNames } from '../common/utils/utils';

interface PageHeaderProps {
  children: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  onBackButtonPress?: () => void;
  // the title is not known yet: a gray placeholder instead of a generic word
  loading?: boolean;
  // long titles (an event's name): smaller, at most two lines, the full text in the tooltip
  compact?: boolean;
}

const PageHeader = ({
  children,
  subtitle,
  actions,
  onBackButtonPress,
  loading,
  compact,
}: PageHeaderProps) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="flex items-start gap-3 min-w-0 flex-1 basis-80">
      {onBackButtonPress && (
        <button
          type="button"
          aria-label={i18n.t('general:back')}
          title={i18n.t('general:back')}
          className="mt-1 w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border border-cool-gray-200 bg-white text-cool-gray-700 hover:bg-cool-gray-50 focus:outline-none focus-visible:shadow-focus"
          onClick={onBackButtonPress}
        >
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        {loading ? (
          <>
            <h1 className="sr-only">{i18n.t('states:loading')}</h1>
            <span
              aria-hidden="true"
              className="block mt-1.5 h-8 w-2/3 max-w-md rounded-md bg-cool-gray-200 animate-pulse"
            />
          </>
        ) : (
          <h1
            className={classNames(compact ? 'sm:!text-2xl sm:!leading-8 line-clamp-2' : '')}
            title={compact ? children : undefined}
          >
            {children}
          </h1>
        )}
        {subtitle && <div className="mt-1 text-cool-gray-600">{subtitle}</div>}
      </div>
    </div>
    {/* on phones the actions take the full width, the main (yellow) one last, nearest the thumb */}
    {actions && (
      <div className="w-full sm:w-auto flex flex-wrap items-center gap-3 [&>*]:grow sm:[&>*]:grow-0">
        {actions}
      </div>
    )}
  </div>
);

export default PageHeader;
