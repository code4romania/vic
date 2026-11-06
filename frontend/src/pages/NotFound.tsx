import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/app_logo.svg';

const NotFound = () => {
  const { t } = useTranslation('not_found');

  return (
    <div className="min-h-[100vh] w-full flex flex-col items-center justify-center gap-6 px-4 text-center">
      <img src={logo} alt="VIC" className="max-h-11" />
      <h1 className="font-robotoBold text-2xl">{t('title')}</h1>
      <p className="max-w-md text-cool-gray-500">{t('description')}</p>
      <Link to="/" className="btn-primary">
        {t('home')}
      </Link>
    </div>
  );
};

export default NotFound;
