import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

export const isMobileDevice = (): boolean => /android|iphone|ipad|ipod/i.test(navigator.userAgent);

interface OpenAppBoxProps {
  title: string;
  description?: ReactNode;
  // Fills the login screen of the app (vic://login?email=, decisions R17).
  email?: string;
}

// A volunteer belongs in the mobile app: an Open the app button on phones, the store links everywhere.
const OpenAppBox = ({ title, description, email }: OpenAppBoxProps) => {
  const { t } = useTranslation('auth');
  const appStore = import.meta.env.VITE_APP_STORE_URL;
  const playStore = import.meta.env.VITE_PLAY_STORE_URL;
  const deepLink = `vic://login${email ? `?email=${encodeURIComponent(email)}` : ''}`;

  return (
    <div
      role="status"
      className="rounded-lg border border-cool-gray-200 bg-cool-gray-50 p-4 text-sm flex items-start gap-3"
    >
      <span className="w-9 h-9 shrink-0 rounded-full bg-navy text-yellow flex items-center justify-center">
        <DevicePhoneMobileIcon className="w-5 h-5" aria-hidden="true" />
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <p className="font-robotoBold text-cool-gray-900">{title}</p>
        {description && <p className="text-cool-gray-600">{description}</p>}
        {isMobileDevice() && (
          <a className="btn-primary text-center" href={deepLink}>
            {t('open_app')}
          </a>
        )}
        {(appStore || playStore) && (
          <div className="flex flex-wrap gap-2">
            {appStore && (
              <a className="btn-secondary py-1.5" href={appStore} target="_blank" rel="noreferrer">
                App Store
              </a>
            )}
            {playStore && (
              <a className="btn-secondary py-1.5" href={playStore} target="_blank" rel="noreferrer">
                Google Play
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenAppBox;
