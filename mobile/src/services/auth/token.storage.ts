import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'vic.accessToken';
const REFRESH_TOKEN_KEY = 'vic.refreshToken';
// Kept in AsyncStorage on purpose: it goes away with an uninstall, the keychain does not.
const INSTALL_FLAG_KEY = 'vic.legacyCleared';
// What Amplify (1.0.x builds) left behind.
const LEGACY_KEY_PREFIXES = ['CognitoIdentityServiceProvider.', 'amplify-'];

export interface ITokens {
  accessToken: string;
  // Absent when two refreshes crossed: keep the refresh token already stored.
  refreshToken?: string;
}

// undefined: not read from the secure storage yet; null: no token.
let accessTokenCache: string | null | undefined;

export const getAccessToken = async (): Promise<string | null> => {
  if (accessTokenCache === undefined) {
    accessTokenCache = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }
  return accessTokenCache;
};

export const getRefreshToken = (): Promise<string | null> =>
  SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

export const setTokens = async ({ accessToken, refreshToken }: ITokens): Promise<void> => {
  accessTokenCache = accessToken;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearTokens = async (): Promise<void> => {
  accessTokenCache = null;
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
};

// Runs once per install, before anything reads the tokens:
// - removes the Cognito / Amplify keys a 1.0.x build left in AsyncStorage;
// - drops tokens the iOS keychain kept from a previous install of the app.
export const clearLegacyStorage = async (): Promise<void> => {
  try {
    if (await AsyncStorage.getItem(INSTALL_FLAG_KEY)) {
      return;
    }
    const keys = await AsyncStorage.getAllKeys();
    const legacyKeys = keys.filter((key) =>
      LEGACY_KEY_PREFIXES.some((prefix) => key.startsWith(prefix)),
    );
    if (legacyKeys.length) {
      await AsyncStorage.multiRemove(legacyKeys);
    }
    await clearTokens();
    await AsyncStorage.setItem(INSTALL_FLAG_KEY, '1');
  } catch {
    // Not worth blocking the start of the app: it runs again on the next launch.
  }
};
