import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setLogger } from 'react-query';
import '../common/config/i18n';
import { server } from './server';
import { tokenStore } from '../services/auth/token.store';
import API from '../services/api';

// jsdom's XMLHttpRequest never finishes sending a File through MSW, so multipart calls (registration,
// organization edit) would hang. Same axios instance and interceptors, fetch transport.
API.defaults.adapter = 'fetch';

// jsdom lacks these; Headless UI and the data table use them.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver ?? ResizeObserverStub;
window.matchMedia =
  window.matchMedia ??
  ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList);

// Failed queries are expected in these specs; react-query would print each one.
setLogger({ log: () => {}, warn: () => {}, error: () => {} });

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  tokenStore.clear();
});
afterAll(() => server.close());
