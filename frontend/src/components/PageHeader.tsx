import React, { ReactNode } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';

interface PageHeaderProps {
  children: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  onBackButtonPress?: () => void;
}

const PageHeader = ({ children, subtitle, actions, onBackButtonPress }: PageHeaderProps) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="flex items-start gap-3 min-w-0 flex-1 basis-80">
      {onBackButtonPress && (
        <button
          type="button"
          aria-label={i18n.t('general:back')}
          title={i18n.t('general:back')}
          className="mt-1 w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-cool-gray-200 bg-white text-cool-gray-700 hover:bg-cool-gray-50"
          onClick={onBackButtonPress}
        >
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      <div className="min-w-0">
        <h1>{children}</h1>
        {subtitle && <p className="mt-1 text-cool-gray-500">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
  </div>
);

export default PageHeader;
