import React from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/app_logo.svg';

// Shown instead of any page while the API answers 503 MAINTENANCE (the cutover window, decisions R2).
const Maintenance = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation('auth');

  return (
    <div className="min-h-[100vh] w-full flex flex-col items-center justify-center gap-6 px-4 text-center">
      <img src={logo} alt="VIC" className="max-h-11" />
      <h1 className="font-robotoBold text-2xl">{t('maintenance.title')}</h1>
      <p className="max-w-md text-cool-gray-500">{t('maintenance.description')}</p>
      <button
        className="bg-yellow-500 hover:bg-yellow-600 px-6 py-2 rounded-lg shadow"
        onClick={onRetry}
      >
        {t('maintenance.retry')}
      </button>
    </div>
  );
};

export default Maintenance;
