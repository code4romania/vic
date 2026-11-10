import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import Card from '../layouts/CardLayout';

// Inside the app layout: a page this admin may not open (e.g. validation for a plain admin).
const Forbidden = () => {
  const { t } = useTranslation('forbidden');

  return (
    <Card>
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <span className="w-14 h-14 rounded-full bg-navy text-yellow flex items-center justify-center">
          <LockClosedIcon className="w-7 h-7" aria-hidden="true" />
        </span>
        <h1 className="text-2xl sm:text-[1.75rem] sm:leading-9">{t('title')}</h1>
        <p className="max-w-md text-cool-gray-600">{t('description')}</p>
        <Link to="/" className="btn-primary mt-2">
          {t('home')}
        </Link>
      </div>
    </Card>
  );
};

export default Forbidden;
