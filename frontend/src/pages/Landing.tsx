import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarDaysIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import logo from '../assets/images/app_logo.svg';

const FEATURES: { key: 'volunteers' | 'events' | 'hours' | 'documents'; icon: ReactNode }[] = [
  { key: 'volunteers', icon: <UsersIcon className="w-6 h-6" aria-hidden="true" /> },
  { key: 'events', icon: <CalendarDaysIcon className="w-6 h-6" aria-hidden="true" /> },
  { key: 'hours', icon: <ClockIcon className="w-6 h-6" aria-hidden="true" /> },
  { key: 'documents', icon: <DocumentTextIcon className="w-6 h-6" aria-hidden="true" /> },
];

// "/" when logged out (R29). NGO Hub's link and the announcement emails point here.
const Landing = () => {
  const { t } = useTranslation('landing');
  const appStore = import.meta.env.VITE_APP_STORE_URL;
  const playStore = import.meta.env.VITE_PLAY_STORE_URL;

  return (
    <div className="min-h-[100vh] w-full bg-canvas flex flex-col">
      <header className="w-full bg-white border-b border-cool-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <img src={logo} alt="VIC" className="h-9" />
          <Link to="/login" className="btn-outline-secondary">
            {t('login')}
          </Link>
        </div>
      </header>

      <section className="w-full bg-navy">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-14 sm:py-20 flex flex-col gap-5 items-start">
          <h1 className="text-white text-3xl sm:text-[2.75rem] sm:leading-[3.25rem] max-w-3xl">
            {t('title')}
          </h1>
          <p className="text-navy-100 text-base sm:text-lg max-w-2xl">{t('subtitle')}</p>
          <div className="flex flex-wrap gap-3 mt-3">
            <Link to="/register" className="btn-primary">
              {t('register')}
            </Link>
            <Link
              to="/login"
              className="btn border border-white/40 text-white hover:bg-white/10 hover:text-white"
            >
              {t('login')}
            </Link>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-10 sm:py-14 flex flex-col gap-8">
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ key, icon }) => (
            <div
              key={key}
              className="bg-white rounded-xl border border-cool-gray-200 shadow-card p-6 flex flex-col gap-3"
            >
              <span className="w-11 h-11 rounded-lg bg-navy-50 text-navy flex items-center justify-center">
                {icon}
              </span>
              <h2>{t(`features.${key}.title`)}</h2>
              <p className="text-sm text-cool-gray-600">{t(`features.${key}.description`)}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-xl border border-cool-gray-200 shadow-card p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="w-11 h-11 shrink-0 rounded-full bg-navy text-yellow flex items-center justify-center">
            <DevicePhoneMobileIcon className="w-6 h-6" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <h2>{t('volunteers.title')}</h2>
            <p className="text-sm text-cool-gray-600">{t('volunteers.description')}</p>
          </div>
          {(appStore || playStore) && (
            <div className="flex flex-wrap gap-2">
              {appStore && (
                <a className="btn-secondary" href={appStore} target="_blank" rel="noreferrer">
                  App Store
                </a>
              )}
              {playStore && (
                <a className="btn-secondary" href={playStore} target="_blank" rel="noreferrer">
                  Google Play
                </a>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="w-full border-t border-cool-gray-200 bg-white">
        <p className="max-w-6xl mx-auto px-4 sm:px-8 py-5 text-xs text-cool-gray-500">
          {t('footer')}
        </p>
      </footer>
    </div>
  );
};

export default Landing;
