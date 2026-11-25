/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    rollupOptions: {
      output: {
        // The pdf.js worker ships as .mjs, but the Amplify rewrite (terraform-ngohub modules/amplify)
        // serves index.html for every extension outside css|gif|ico|jpg|js|png|txt|svg|webp|woff|ttf|
        // map|json, so a .mjs worker arrives as text/html and the viewer cannot start (#726). Publishing
        // it as .js keeps it a real file on every Amplify app; it is still loaded as a module worker.
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? '';
          return name.endsWith('.mjs')
            ? 'assets/[name]-[hash].js'
            : 'assets/[name]-[hash][extname]';
        },
      },
    },
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
      VITE_APP_STORE_URL: 'https://apps.apple.test/vic',
      VITE_PLAY_STORE_URL: 'https://play.google.test/vic',
      VITE_MIGRATION_NOTICE_UNTIL: '2099-12-31',
      VITE_TERMS_URL: 'https://vic.test/terms',
      VITE_PRIVACY_URL: 'https://vic.test/privacy',
    },
  },
});
