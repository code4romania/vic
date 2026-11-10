import React from 'react';
import i18n from '../common/config/i18n';
import Button from './Button';
import EmptyContent from './EmptyContent';

interface LoadErrorContentProps {
  // Refetches what failed; without it only the message shows
  onRetry?: () => void;
}

// A request that failed is not an empty list: the warning, plus a retry button.
const LoadErrorContent = ({ onRetry }: LoadErrorContentProps) => (
  <EmptyContent
    description={i18n.t('general:error.load_entries')}
    action={
      onRetry && (
        <Button
          type="button"
          label={i18n.t('states:retry')}
          className="btn-outline-secondary"
          onClick={onRetry}
        />
      )
    }
  />
);

export default LoadErrorContent;
