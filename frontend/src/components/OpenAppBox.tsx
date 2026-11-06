import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

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
      className="rounded-lg bg-blue-50 border border-blue-300 p-4 text-sm flex flex-col gap-2"
    >
      <p className="font-robotoBold">{title}</p>
      {description && <p>{description}</p>}
      {isMobileDevice() && (
        <a className="btn-primary text-center" href={deepLink}>
          {t('open_app')}
        </a>
      )}
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
    </div>
  );
};

export default OpenAppBox;
