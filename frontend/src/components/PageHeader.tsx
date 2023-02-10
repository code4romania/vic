import React from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import Button from './Button';

interface PageHeaderProps {
  children: string;
  onBackButtonPress?: () => void;
}

const PageHeader = ({ children, onBackButtonPress }: PageHeaderProps) => (
  <div className="flex gap-4 items-center">
    {onBackButtonPress && (
      <Button
        label={i18n.t('general:back')}
        icon={<ChevronLeftIcon className="-ml-1 mr-2 sm:h-5 sm:w-5 h-4 w-4" aria-hidden="true" />}
        className="btn-secondary"
        type="button"
        onClick={onBackButtonPress}
      />
    )}
    <h1>{children}</h1>
  </div>
);

export default PageHeader;
