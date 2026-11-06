/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  plugins: [
    react(),
    // npm run lint is the gate; under Vitest the plugin would only slow every transform.
    ...(process.env.VITEST
      ? []
      : [
          eslint({
            fix: true,
            failOnWarning: true,
          }),
        ]),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
    env: {
      VITE_API_URL: 'http://api.test',
      VITE_TURNSTILE_SITE_KEY: 'test-site-key',
      VITE_APP_STORE_URL: 'https://apps.apple.test/vic',
      VITE_PLAY_STORE_URL: 'https://play.google.test/vic',
      VITE_MIGRATION_NOTICE_UNTIL: '2099-12-31',
      VITE_TERMS_URL: 'https://vic.test/terms',
      VITE_PRIVACY_URL: 'https://vic.test/privacy',
    },
  },
});
