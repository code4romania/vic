import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/app_logo.svg';

// "/" when logged out (R29). NGO Hub's link and the announcement emails point here.
const Landing = () => {
  const { t } = useTranslation('landing');
  const appStore = import.meta.env.VITE_APP_STORE_URL;
  const playStore = import.meta.env.VITE_PLAY_STORE_URL;

  const features = ['volunteers', 'events', 'hours', 'documents'] as const;

  return (
    <div className="min-h-[100vh] w-full bg-gray-50 flex flex-col">
      <header className="w-full bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <img src={logo} alt="VIC" className="max-h-9" />
          <Link to="/login" className="btn-outline-secondary">
            {t('login')}
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 flex flex-col gap-12">
        <section className="flex flex-col gap-4 items-start">
          <h1 className="font-robotoBold text-3xl sm:text-4xl max-w-2xl">{t('title')}</h1>
          <p className="text-cool-gray-500 text-lg max-w-2xl">{t('subtitle')}</p>
          <div className="flex flex-wrap gap-4 mt-2">
            <Link to="/register" className="btn-primary">
              {t('register')}
            </Link>
            <Link to="/login" className="btn-outline-secondary">
              {t('login')}
            </Link>
          </div>
        </section>

        <section className="grid sm:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature} className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
              <h2 className="font-robotoBold text-lg">{t(`features.${feature}.title`)}</h2>
              <p className="text-cool-gray-500">{t(`features.${feature}.description`)}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-lg shadow p-6 flex flex-col gap-3">
          <h2 className="font-robotoBold text-lg">{t('volunteers.title')}</h2>
          <p className="text-cool-gray-500">{t('volunteers.description')}</p>
          <div className="flex gap-4">
            {appStore && (
              <a className="underline" href={appStore} target="_blank" rel="noreferrer">
                App Store
              </a>
            )}
            {playStore && (
              <a className="underline" href={playStore} target="_blank" rel="noreferrer">
                Google Play
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
