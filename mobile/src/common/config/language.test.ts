import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';
import {
  applyLanguage,
  hasPendingLanguageChoice,
  LANGUAGE_KEY,
  resetLanguageState,
  resolveInitialLanguage,
} from './language';
import { mockDeviceLanguage } from '../../test/i18n';

const stored = async () => JSON.parse((await AsyncStorage.getItem(LANGUAGE_KEY)) ?? 'null');

beforeEach(async () => {
  // the app starts in Romanian before the language is resolved, whatever language the suite runs in
  await i18n.changeLanguage('ro');
  resetLanguageState();
  mockDeviceLanguage('ro');
});

describe('the language at start', () => {
  describe('a new install follows the phone', () => {
    it.each([
      ['en', 'en'],
      ['ro', 'ro'],
      // neither Romanian nor English: Romanian
      ['de', 'ro'],
      ['hu', 'ro'],
      [null, 'ro'],
    ])('phone in %s: the app starts in %s', async (device, expected) => {
      mockDeviceLanguage(device);

      expect(await resolveInitialLanguage()).toBe(expected);

      expect(i18n.language).toBe(expected);
      // saved, and not as a choice the account still has to receive
      expect(await stored()).toEqual({ language: expected, pending: false });
      expect(hasPendingLanguageChoice()).toBe(false);
    });

    it('keeps that language when the phone changes language later', async () => {
      mockDeviceLanguage('en');
      await resolveInitialLanguage();

      mockDeviceLanguage('ro');
      await i18n.changeLanguage('ro');
      expect(await resolveInitialLanguage()).toBe('en');
      expect(i18n.language).toBe('en');
    });
  });

  describe('an app that was already installed stays in Romanian', () => {
    it.each([
      ['the one-time cleanup flag', 'vic.legacyCleared', '1'],
      ['the intro was seen', 'vic.onboarding.seen', '1'],
      ['the language key of the 1.0.x builds', 'user-language', 'ro'],
      ['Cognito leftovers', 'CognitoIdentityServiceProvider.abc.LastAuthUser', 'ana'],
      ['Amplify leftovers', 'amplify-signin-with-hostedUI', 'false'],
    ])('%s is in the storage and the phone is in English', async (_, key, value) => {
      await AsyncStorage.setItem(key, value);
      mockDeviceLanguage('en');

      expect(await resolveInitialLanguage()).toBe('ro');

      expect(i18n.language).toBe('ro');
      expect(await stored()).toEqual({ language: 'ro', pending: false });
    });

    it('never takes the value of the old language key', async () => {
      // 1.0.x saved the language there; since 2.0 the app ignored it and showed Romanian
      await AsyncStorage.setItem('user-language', 'en');
      mockDeviceLanguage('en');

      expect(await resolveInitialLanguage()).toBe('ro');
      expect(await AsyncStorage.getItem('user-language')).toBe('en');
    });
  });

  describe('the saved choice wins', () => {
    it('over the phone and over the marks of an existing install', async () => {
      await AsyncStorage.setItem('vic.legacyCleared', '1');
      await AsyncStorage.setItem(LANGUAGE_KEY, JSON.stringify({ language: 'en', pending: false }));
      mockDeviceLanguage('ro');

      expect(await resolveInitialLanguage()).toBe('en');
      expect(i18n.language).toBe('en');
    });

    it('remembers that the account has not received it yet', async () => {
      await AsyncStorage.setItem(LANGUAGE_KEY, JSON.stringify({ language: 'en', pending: true }));

      await resolveInitialLanguage();

      expect(hasPendingLanguageChoice()).toBe(true);
    });

    it('ignores a saved value that is not a language of the app', async () => {
      await AsyncStorage.setItem(LANGUAGE_KEY, JSON.stringify({ language: 'fr', pending: true }));
      mockDeviceLanguage('en');

      expect(await resolveInitialLanguage()).toBe('en');
      expect(hasPendingLanguageChoice()).toBe(false);
    });

    it('ignores a saved value that cannot be read', async () => {
      await AsyncStorage.setItem(LANGUAGE_KEY, 'not json');
      mockDeviceLanguage('en');

      expect(await resolveInitialLanguage()).toBe('en');
    });
  });

  it('starts in Romanian when the storage cannot be read at all', async () => {
    // (the storage is already a jest mock: one failed answer each, nothing to restore)
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('no storage'));
    (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValueOnce(new Error('no storage'));
    mockDeviceLanguage('en');

    expect(await resolveInitialLanguage()).toBe('ro');
    expect(i18n.language).toBe('ro');
  });
});

describe('applyLanguage', () => {
  it('changes the app at once and saves a choice as pending for the account', async () => {
    await applyLanguage('en', true);

    expect(i18n.language).toBe('en');
    expect(await stored()).toEqual({ language: 'en', pending: true });
    expect(hasPendingLanguageChoice()).toBe(true);
  });

  it('a language that came from the account is not pending', async () => {
    await applyLanguage('en', true);
    await applyLanguage('ro', false);

    expect(i18n.language).toBe('ro');
    expect(await stored()).toEqual({ language: 'ro', pending: false });
    expect(hasPendingLanguageChoice()).toBe(false);
  });

  it('still changes the app when the choice cannot be saved', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('full'));

    await applyLanguage('en', true);

    expect(i18n.language).toBe('en');
    expect(await stored()).toBeNull();
  });
});
