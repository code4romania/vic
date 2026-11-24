// Jest setup: in-memory native modules, so the auth code runs without a device.
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// expo-secure-store: a Map; `secureStore.__reset()` between tests.
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    __store: store,
  };
});

// Unistyles 3: the library's jest mocks, then our themes
require('react-native-unistyles/mocks');
require('../design/theme');

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(async () => undefined),
  impactAsync: jest.fn(async () => undefined),
  notificationAsync: jest.fn(async () => undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
  // missing from the official mock; the VIC 2.0 UI kit reads it to skip motion
  useReducedMotion: () => false,
  // missing from the official mock too; the impact hexagon drives its waves with it
  useFrameCallback: () => ({ setActive: () => undefined, isActive: false, callbackId: -1 }),
}));

// Skia has no native module in jest: canvases render as plain views, paths as stubs.
jest.mock('@shopify/react-native-skia', () => {
  const { View } = require('react-native');
  const Stub = () => null;
  const path = () => ({ toSVGString: () => '' });
  return {
    Canvas: View,
    Group: View,
    Path: Stub,
    Rect: Stub,
    Skia: { Path: { Make: path, MakeFromSVGString: path } },
  };
});

jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest'),
);

jest.mock('expo-application', () => ({ nativeApplicationVersion: '1.1.0' }));

jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(async () => undefined),
  preventAutoHideAsync: jest.fn(async () => undefined),
}));

jest.mock('react-native-toast-message/lib/src/Toast', () => ({ Toast: { show: jest.fn() } }));
jest.mock('react-native-toast-message', () => {
  // a host component (rendered at the root and in modal screens) that also has Toast.show
  const Toast: any = () => null;
  Toast.show = jest.fn();
  return { __esModule: true, default: Toast };
});

// The three social SDKs: each test sets what the sheet answers.
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(async () => true),
    signIn: jest.fn(),
    signOut: jest.fn(async () => undefined),
  },
  isCancelledResponse: (response: { type: string }) => response.type === 'cancelled',
  isErrorWithCode: (error: any) => !!error?.code,
  statusCodes: { IN_PROGRESS: 'IN_PROGRESS', SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED' },
}));

jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn(),
  AppleAuthenticationScope: { EMAIL: 1, FULL_NAME: 0 },
}));

// The phone's language: Romanian unless a test says otherwise (`mockDeviceLanguage('en')`).
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'ro', languageTag: 'ro-RO' }]),
}));

// Every test starts in the same language whatever the previous one did: Romanian, or the one in
// TEST_LANG (`TEST_LANG=en npm test` runs the whole suite in English, which proves the tests look
// their texts up instead of spelling them out in one language).
const TEST_LANGUAGE: 'ro' | 'en' = process.env.TEST_LANG === 'en' ? 'en' : 'ro';

// also before the test file itself is read, so a text looked up while the tests are being
// declared (an `it.each` table) is already in the test language
require('../common/config/i18n').default.changeLanguage(TEST_LANGUAGE);

beforeEach(async () => {
  (require('expo-secure-store') as any).__store.clear();
  await mockAsyncStorage.clear();
  require('../common/config/language').resetLanguageState();
  require('../services/language/language.service').resetLanguageSync();
  const i18n = require('../common/config/i18n').default;
  if (i18n.language !== TEST_LANGUAGE) {
    await i18n.changeLanguage(TEST_LANGUAGE);
  }
});
