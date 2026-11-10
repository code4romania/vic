import React from 'react';
import { useTranslation } from 'react-i18next';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import ErrorScreen from '../components/ErrorScreen';

// Shown instead of any page while the API answers 503 MAINTENANCE (the cutover window, decisions R2).
const Maintenance = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation('auth');

  return (
    <ErrorScreen
      icon={<WrenchScrewdriverIcon className="w-7 h-7" aria-hidden="true" />}
      title={t('maintenance.title')}
      description={t('maintenance.description')}
      actions={
        <button type="button" className="btn-primary" onClick={onRetry}>
          {t('maintenance.retry')}
        </button>
      }
    />
  );
};

export default Maintenance;
