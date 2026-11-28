// The VIC app in the stores. An env value wins (VITE_APP_STORE_URL / VITE_PLAY_STORE_URL); without
// one the public listings are used, so both buttons always show (staging had only the Play URL set).
// App Store id 6474194051 is the listing the 2.0 builds are uploaded to (mobile/eas.json, ascAppId).
export const APP_STORE_URL =
  import.meta.env.VITE_APP_STORE_URL || 'https://apps.apple.com/ro/app/vic/id6474194051';
export const PLAY_STORE_URL =
  import.meta.env.VITE_PLAY_STORE_URL ||
  'https://play.google.com/store/apps/details?id=org.commitglobal.vic';
