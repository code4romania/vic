import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import polyfillNode from 'rollup-plugin-polyfill-node';
import EnvironmentPlugin from 'vite-plugin-environment';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [polyfillNode()],
    },
  },
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser',
    },
  },
  plugins: [
    react(),
    eslint({
      fix: true,
      failOnWarning: true,
    }),
    EnvironmentPlugin('all', { loadEnvFiles: true }),
  ],
});
