import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  appleRedirectUri,
  appleSdkUrl,
  appleServicesId,
  googleClientId,
  googleSdkUrl,
  isAppleCancel,
  loadScript,
} from '../common/utils/social-sdk';

export type SocialProvider = 'google' | 'apple';

interface SocialLoginButtonsProps {
  onToken: (provider: SocialProvider, token: string) => void;
  onError: () => void;
  disabled?: boolean;
}

const AppleLogo = () => (
  <svg viewBox="0 0 17 20" className="w-4 h-5" aria-hidden="true" fill="currentColor">
    <path d="M14.2 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9C3.6 4.8 2 5.8 1.1 7.4c-1.9 3.2-.5 8 1.3 10.6.9 1.3 2 2.7 3.3 2.6 1.3-.1 1.8-.9 3.4-.9 1.6 0 2 .9 3.4.8 1.4 0 2.3-1.3 3.2-2.6 1-1.5 1.4-2.9 1.4-3-.1 0-2.9-1.1-2.9-4.3zM11.6 3c.7-.9 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z" />
  </svg>
);

// "Continuă cu Google" / "Continuă cu Apple" on the login page (#512). Each button appears only when its
// id is configured; Google draws its own button (brand rules), Apple's is ours, in Apple's black.
const SocialLoginButtons = ({ onToken, onError, disabled }: SocialLoginButtonsProps) => {
  const { t, i18n } = useTranslation('login');
  const language = i18n.language === 'en' ? 'en' : 'ro';
  const googleId = googleClientId();
  const appleId = appleServicesId();
  const googleButton = useRef<HTMLDivElement>(null);
  const [appleReady, setAppleReady] = useState(false);
  // The SDK keeps the first callback; this ref always points at the current props.
  const handlers = useRef({ onToken, onError });
  handlers.current = { onToken, onError };

  useEffect(() => {
    if (!googleId) return;
    let cancelled = false;
    loadScript(googleSdkUrl(language))
      .then(() => {
        const gis = window.google?.accounts.id;
        if (cancelled || !gis || !googleButton.current) return;
        gis.initialize({
          client_id: googleId,
          ux_mode: 'popup',
          callback: ({ credential }) =>
            credential
              ? handlers.current.onToken('google', credential)
              : handlers.current.onError(),
        });
        gis.renderButton(googleButton.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
          locale: language,
          width: googleButton.current.offsetWidth || 360,
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [googleId, language]);

  useEffect(() => {
    if (!appleId) return;
    let cancelled = false;
    loadScript(appleSdkUrl(language))
      .then(() => {
        if (cancelled || !window.AppleID) return;
        window.AppleID.auth.init({
          clientId: appleId,
          scope: 'email',
          redirectURI: appleRedirectUri(),
          usePopup: true,
        });
        setAppleReady(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [appleId, language]);

  if (!googleId && !appleId) return null;

  const signInWithApple = async () => {
    try {
      const result = await window.AppleID?.auth.signIn();
      const token = result?.authorization?.id_token;
      if (token) handlers.current.onToken('apple', token);
      else handlers.current.onError();
    } catch (error) {
      if (!isAppleCancel(error)) handlers.current.onError();
    }
  };

  return (
    <div className="flex flex-col gap-3" aria-busy={disabled}>
      {googleId && (
        <div
          ref={googleButton}
          data-testid="google-signin"
          className={`w-full flex justify-center min-h-[44px] ${disabled ? 'pointer-events-none opacity-60' : ''}`}
        />
      )}
      {appleId && (
        <button
          type="button"
          onClick={signInWithApple}
          disabled={disabled || !appleReady}
          className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy"
        >
          <AppleLogo />
          {t('social.apple')}
        </button>
      )}
      <div className="flex items-center gap-3 text-xs text-cool-gray-500" aria-hidden="true">
        <span className="h-px flex-1 bg-cool-gray-200" />
        {t('social.or')}
        <span className="h-px flex-1 bg-cool-gray-200" />
      </div>
    </div>
  );
};

export default SocialLoginButtons;
