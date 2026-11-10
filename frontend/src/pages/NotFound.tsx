import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';
import ErrorScreen from '../components/ErrorScreen';

const NotFound = () => {
  const { t } = useTranslation('not_found');
  const navigate = useNavigate();

  return (
    <ErrorScreen
      code="404"
      title={t('title')}
      description={t('description')}
      actions={
        <>
          <button type="button" className="btn-outline-secondary" onClick={() => navigate(-1)}>
            <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" />
            {t('back')}
          </button>
          <Link to="/" className="btn-primary">
            <HomeIcon className="w-4 h-4" aria-hidden="true" />
            {t('home')}
          </Link>
        </>
      }
    />
  );
};

export default NotFound;
