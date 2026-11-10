// Google Identity Services and Sign in with Apple JS, loaded only on the login page and only when their
// ids are set (VITE_GOOGLE_CLIENT_ID, VITE_APPLE_SERVICES_ID). Both hand back an ID token that the
// backend verifies (POST /auth/web/social, #512).

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            ux_mode?: 'popup';
          }): void;
          renderButton(element: HTMLElement, options: Record<string, unknown>): void;
        };
      };
    };
    AppleID?: {
      auth: {
        init(options: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }): void;
        signIn(): Promise<{ authorization?: { id_token?: string } }>;
      };
    };
  }
}

export const GOOGLE_SDK_URL = 'https://accounts.google.com/gsi/client';
export const APPLE_SDK_URL =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/ro_RO/appleid.auth.js';

const loading = new Map<string, Promise<void>>();

export const loadScript = (src: string): Promise<void> => {
  if (!loading.has(src)) {
    loading.set(
      src,
      new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
          loading.delete(src);
          reject(new Error(`Could not load ${src}`));
        };
        document.head.appendChild(script);
      }),
    );
  }
  return loading.get(src) as Promise<void>;
};

export const googleClientId = (): string | undefined =>
  import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined;

export const appleServicesId = (): string | undefined =>
  import.meta.env.VITE_APPLE_SERVICES_ID || undefined;

// Apple wants a registered https return URL even for the popup; the login page by default.
export const appleRedirectUri = (): string =>
  import.meta.env.VITE_APPLE_REDIRECT_URI || `${window.location.origin}/login`;

// Apple's popup rejects with { error: 'popup_closed_by_user' } when the person closes it.
export const isAppleCancel = (error: unknown): boolean =>
  ['popup_closed_by_user', 'user_cancelled_authorize'].includes(
    (error as { error?: string })?.error ?? '',
  );
