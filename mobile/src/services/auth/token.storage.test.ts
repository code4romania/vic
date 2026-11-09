import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// token.storage keeps a module-level cache: load a fresh copy for each test.
const load = (): typeof import('./token.storage') => {
  let mod: typeof import('./token.storage');
  jest.isolateModules(() => {
    mod = require('./token.storage');
  });
  return mod!;
};

describe('token.storage', () => {
  it('stores, reads and clears the tokens in the secure storage', async () => {
    const storage = load();
    await storage.setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' });

    expect(await storage.getAccessToken()).toBe('access-1');
    expect(await storage.getRefreshToken()).toBe('refresh-1');
    expect(await SecureStore.getItemAsync('vic.accessToken')).toBe('access-1');

    await storage.clearTokens();
    expect(await storage.getAccessToken()).toBeNull();
    expect(await storage.getRefreshToken()).toBeNull();
  });

  it('keeps the refresh token when a rotation answers without one', async () => {
    const storage = load();
    await storage.setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    await storage.setTokens({ accessToken: 'access-2' });

    expect(await storage.getAccessToken()).toBe('access-2');
    expect(await storage.getRefreshToken()).toBe('refresh-1');
  });

  it('reads the access token from the secure storage once, then from memory', async () => {
    await SecureStore.setItemAsync('vic.accessToken', 'stored');
    const storage = load();
    (SecureStore.getItemAsync as jest.Mock).mockClear();

    expect(await storage.getAccessToken()).toBe('stored');
    expect(await storage.getAccessToken()).toBe('stored');
    expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(1);
  });

  describe('clearLegacyStorage', () => {
    it('removes only the Cognito and Amplify keys, and runs once per install', async () => {
      await AsyncStorage.multiSet([
        ['CognitoIdentityServiceProvider.abc.LastAuthUser', 'u'],
        ['CognitoIdentityServiceProvider.abc.u.idToken', 't'],
        ['amplify-signin-with-hostedUI', 'false'],
        ['user-language', 'ro'],
      ]);
      const storage = load();

      await storage.clearLegacyStorage();

      expect(await AsyncStorage.getAllKeys()).toEqual(
        expect.arrayContaining(['user-language', 'vic.legacyCleared']),
      );
      expect(await AsyncStorage.getAllKeys()).toHaveLength(2);

      // a later login, then the next launch: nothing is cleared again
      await storage.setTokens({ accessToken: 'a', refreshToken: 'r' });
      await AsyncStorage.setItem('amplify-late', 'x');
      await storage.clearLegacyStorage();
      expect(await storage.getRefreshToken()).toBe('r');
      expect(await AsyncStorage.getItem('amplify-late')).toBe('x');
    });

    it('drops tokens the keychain kept from an earlier install', async () => {
      // no install flag in AsyncStorage (fresh install), tokens still in the keychain
      await SecureStore.setItemAsync('vic.refreshToken', 'old-install');
      const storage = load();

      await storage.clearLegacyStorage();

      expect(await storage.getRefreshToken()).toBeNull();
    });
  });
});
