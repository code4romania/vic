import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../common/config/i18n';
import {
  applyLanguage,
  hasPendingLanguageChoice,
  LANGUAGE_KEY,
} from '../../common/config/language';
import useStore from '../../store/store';
import { setUserLanguage } from '../user/user.api';
import * as service from './language.service';

jest.mock('../user/user.api', () => ({ setUserLanguage: jest.fn() }));

const patch = setUserLanguage as jest.Mock;
const stored = async () => JSON.parse((await AsyncStorage.getItem(LANGUAGE_KEY)) ?? 'null');
// lets the request that runs on its own (not awaited by the caller) finish
const settle = () => new Promise((resolve) => setImmediate(resolve));

beforeEach(async () => {
  jest.clearAllMocks();
  await i18n.changeLanguage('ro');
  useStore.setState({ userProfile: null });
  // the account answers with what it keeps: by default, what it was sent
  patch.mockImplementation(async (language: string) => ({ language }));
});

const logIn = (language?: 'ro' | 'en' | null) =>
  useStore.setState({ userProfile: { id: 'u1', firstName: 'Ana', language } as any });

describe('the language after the profile loads', () => {
  it('takes the language of the account, without asking the backend anything', async () => {
    await service.syncLanguageWithAccount('en');

    expect(i18n.language).toBe('en');
    expect(await stored()).toEqual({ language: 'en', pending: false });
    await settle();
    expect(patch).not.toHaveBeenCalled();
  });

  it('an existing account kept in Romanian stays in Romanian on a phone in English', async () => {
    // a new install on an English phone starts in English; the account says Romanian
    await applyLanguage('en', false);

    await service.syncLanguageWithAccount('ro');

    expect(i18n.language).toBe('ro');
    expect(patch).not.toHaveBeenCalled();
  });

  it('an account with no language yet takes the language of the app, without overwriting', async () => {
    await applyLanguage('en', false);

    await service.syncLanguageWithAccount(null);
    await settle();

    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledWith('en', false);
    expect(i18n.language).toBe('en');
  });

  it('and follows the account when another device filled it first', async () => {
    await applyLanguage('en', false);
    patch.mockResolvedValue({ language: 'ro' });

    await service.syncLanguageWithAccount(undefined);
    await settle();

    expect(patch).toHaveBeenCalledWith('en', false);
    expect(i18n.language).toBe('ro');
    expect(await stored()).toEqual({ language: 'ro', pending: false });
  });

  it('a choice made before login wins over the account and is sent as a choice', async () => {
    await applyLanguage('en', true);

    await service.syncLanguageWithAccount('ro');
    await settle();

    expect(patch).toHaveBeenCalledWith('en', true);
    expect(i18n.language).toBe('en');
    expect(hasPendingLanguageChoice()).toBe(false);
    expect(await stored()).toEqual({ language: 'en', pending: false });
  });

  it('a choice that could not be sent stays pending and goes again with the next profile', async () => {
    await applyLanguage('en', true);
    patch.mockRejectedValueOnce(new Error('Network Error'));

    await service.syncLanguageWithAccount('ro');
    await settle();

    expect(i18n.language).toBe('en');
    expect(hasPendingLanguageChoice()).toBe(true);
    expect(await stored()).toEqual({ language: 'en', pending: true });

    await service.syncLanguageWithAccount('ro');
    await settle();

    expect(patch).toHaveBeenCalledTimes(2);
    expect(patch).toHaveBeenLastCalledWith('en', true);
    expect(hasPendingLanguageChoice()).toBe(false);
    expect(i18n.language).toBe('en');
  });

  it('a failed request never rejects: the login goes on', async () => {
    patch.mockRejectedValue(new Error('Network Error'));

    await expect(service.syncLanguageWithAccount(null)).resolves.toBeUndefined();
    await settle();

    expect(i18n.language).toBe('ro');
  });
});

describe('choosing a language in the switcher', () => {
  it('before login: the app changes and the choice waits for the account', async () => {
    await service.chooseLanguage('en');

    expect(i18n.language).toBe('en');
    expect(patch).not.toHaveBeenCalled();
    expect(await stored()).toEqual({ language: 'en', pending: true });
  });

  it('logged in: the account gets it as a choice and the profile in memory follows', async () => {
    logIn('ro');

    await service.chooseLanguage('en');

    expect(i18n.language).toBe('en');
    expect(patch).toHaveBeenCalledWith('en', true);
    expect(await stored()).toEqual({ language: 'en', pending: false });
    expect(useStore.getState().userProfile?.language).toBe('en');
  });

  it('logged in and offline: the app still changes and the choice stays pending', async () => {
    logIn('ro');
    patch.mockRejectedValueOnce(new Error('Network Error'));

    await service.chooseLanguage('en');

    expect(i18n.language).toBe('en');
    expect(hasPendingLanguageChoice()).toBe(true);
    expect(await stored()).toEqual({ language: 'en', pending: true });
  });

  it('a profile requested before the choice does not bring the old language back', async () => {
    logIn('ro');

    await service.chooseLanguage('en');
    // the answer of a request sent before the switch arrives now, with the old language
    await service.syncLanguageWithAccount('ro');

    expect(i18n.language).toBe('en');
  });

  it('switching twice quickly keeps the last choice pending until the account has it', async () => {
    logIn('ro');
    let answerFirst: (value: { language: string }) => void = () => undefined;
    patch.mockImplementationOnce(
      () => new Promise((resolve) => (answerFirst = resolve as typeof answerFirst)),
    );

    const first = service.chooseLanguage('en');
    await settle();
    await service.chooseLanguage('ro');
    answerFirst({ language: 'en' });
    await first;

    expect(i18n.language).toBe('ro');
    expect(patch).toHaveBeenLastCalledWith('ro', true);
    expect(await stored()).toEqual({ language: 'ro', pending: false });
  });
});
