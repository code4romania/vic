import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          language?: string;
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise: Promise<void> | null = null;

const loadScript = (): Promise<void> => {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('turnstile script failed to load'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
};

interface TurnstileProps {
  // A token, or '' when it expired or failed.
  onToken: (token: string) => void;
  // Change it to get a fresh widget (a token is single use: reset after a failed submit).
  resetKey?: number;
  language?: string;
}

// The Cloudflare Turnstile widget for NGO registration (VITE_TURNSTILE_SITE_KEY).
const Turnstile = ({ onToken, resetKey, language }: TurnstileProps) => {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;

  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    let widgetId: string | undefined;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile || !siteKey) return;
        widgetId = window.turnstile.render(container.current, {
          sitekey: siteKey,
          language,
          callback: (token) => callback.current(token),
          'expired-callback': () => callback.current(''),
          'error-callback': () => callback.current(''),
        });
      })
      .catch(() => callback.current(''));

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [resetKey, language]);

  return <div ref={container} />;
};

export default Turnstile;
