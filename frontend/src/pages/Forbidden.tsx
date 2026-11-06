import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Inside the app layout: a page this admin may not open (e.g. validation for a plain admin).
const Forbidden = () => {
  const { t } = useTranslation('forbidden');

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="font-robotoBold text-2xl">{t('title')}</h1>
      <p className="max-w-md text-cool-gray-500">{t('description')}</p>
      <Link to="/" className="btn-primary">
        {t('home')}
      </Link>
    </div>
  );
};

export default Forbidden;
