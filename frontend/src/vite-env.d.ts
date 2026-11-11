/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_FRONTEND_URL: string;
  readonly VITE_APP_STORE_URL: string;
  readonly VITE_PLAY_STORE_URL: string;
  readonly VITE_MIGRATION_NOTICE_UNTIL: string;
  readonly VITE_TERMS_URL?: string;
  readonly VITE_PRIVACY_URL?: string;
  readonly VITE_HELP_CENTER_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_APPLE_SERVICES_ID?: string;
  readonly VITE_APPLE_REDIRECT_URI?: string;
}

declare const APP_VERSION: string;
