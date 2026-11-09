/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_FRONTEND_URL: string;
  readonly VITE_TURNSTILE_SITE_KEY: string;
  readonly VITE_APP_STORE_URL: string;
  readonly VITE_PLAY_STORE_URL: string;
  readonly VITE_MIGRATION_NOTICE_UNTIL: string;
  readonly VITE_TERMS_URL?: string;
  readonly VITE_PRIVACY_URL?: string;
  readonly VITE_HELP_CENTER_URL?: string;
}

declare const APP_VERSION: string;
