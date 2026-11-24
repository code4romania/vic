import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setLogger } from 'react-query';
import i18n from '../common/config/i18n';
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

// #726: pdf.js needs a real browser (canvas, DOMMatrix, a worker). Specs get a stand-in that reports
// three pages, so the viewer's header, Download and page counter can be tested.
vi.mock('../components/pdf/PdfDocument', async () => {
  const { useEffect } = await import('react');
  const { createElement } = await import('react');
  return {
    default: ({ onPages }: { onPages: (total: number) => void }) => {
      useEffect(() => onPages(3), []);
      return createElement('div', { 'data-testid': 'pdf-document' });
    },
  };
});

// jsdom has no object URLs; downloads and the print frame use them.
URL.createObjectURL = URL.createObjectURL ?? (() => 'blob:test');
URL.revokeObjectURL = URL.revokeObjectURL ?? (() => {});

// Failed queries are expected in these specs; react-query would print each one.
setLogger({ log: () => {}, warn: () => {}, error: () => {} });

// The suite runs in one language, whatever jsdom's browser language is: Romanian by default,
// English with TEST_LANG=en (the specs look their texts up, so both runs must pass). A spec that
// switches language or stores a choice starts the next one clean.
export const TEST_LANGUAGE = process.env.TEST_LANG === 'en' ? 'en' : 'ro';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(async () => {
  window.localStorage.clear();
  if (i18n.language !== TEST_LANGUAGE) await i18n.changeLanguage(TEST_LANGUAGE);
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  tokenStore.clear();
});
afterAll(() => server.close());
