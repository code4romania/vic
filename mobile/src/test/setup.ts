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

jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
  // missing from the official mock; the VIC 2.0 UI kit reads it to skip motion
  useReducedMotion: () => false,
}));

jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest'),
);

jest.mock('expo-application', () => ({ nativeApplicationVersion: '1.1.0' }));

jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(async () => undefined),
  preventAutoHideAsync: jest.fn(async () => undefined),
}));

jest.mock('react-native-toast-message/lib/src/Toast', () => ({ Toast: { show: jest.fn() } }));
jest.mock('react-native-toast-message', () => ({ __esModule: true, default: { show: jest.fn() } }));

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

jest.mock('react-native-fbsdk-next', () => ({
  Settings: { initializeSDK: jest.fn() },
  LoginManager: { logInWithPermissions: jest.fn(), logOut: jest.fn() },
  AccessToken: { getCurrentAccessToken: jest.fn() },
}));

beforeEach(() => {
  (require('expo-secure-store') as any).__store.clear();
  return mockAsyncStorage.clear();
});
