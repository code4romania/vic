import React from 'react';
import { useTranslation } from 'react-i18next';
import { NoSymbolIcon } from '@heroicons/react/24/outline';
import ErrorScreen from '../components/ErrorScreen';

// Shown instead of any page once the API answers 403 AUTH_004 mid-session: the organization was
// suspended by VIC or this admin was disabled. The session is already over.
const AccessBlocked = ({ onBackToLogin }: { onBackToLogin: () => void }) => {
  const { t } = useTranslation('auth');

  return (
    <ErrorScreen
      icon={<NoSymbolIcon className="w-7 h-7" aria-hidden="true" />}
      title={t('access_blocked.title')}
      description={t('access_blocked.description')}
      actions={
        <button type="button" className="btn-primary" onClick={onBackToLogin}>
          {t('access_blocked.back_to_login')}
        </button>
      }
    />
  );
};

export default AccessBlocked;
