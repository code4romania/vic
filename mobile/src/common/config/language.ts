import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from './i18n';

export type AppLanguage = 'ro' | 'en';

export const APP_LANGUAGES: readonly AppLanguage[] = ['ro', 'en'];
export const DEFAULT_LANGUAGE: AppLanguage = 'ro';

/** { language, pending }: `pending` is a choice made in the switcher that the account has not got yet. */
export const LANGUAGE_KEY = 'vic.language';

// What an install from before the app had two languages leaves in AsyncStorage: the legacy
// cleanup flag (token.storage), the intro flag (onboarding), the language key of the 1.0.x builds
// (only its presence counts: its value has been ignored since 2.0), Cognito / Amplify leftovers.
const EXISTING_INSTALL_KEYS = ['vic.legacyCleared', 'vic.onboarding.seen', 'user-language'];
const EXISTING_INSTALL_PREFIXES = ['CognitoIdentityServiceProvider.', 'amplify-'];

interface IStoredLanguage {
  language: AppLanguage;
  pending: boolean;
}

export const isAppLanguage = (value: unknown): value is AppLanguage =>
  value === 'ro' || value === 'en';

// kept in memory too, so the sync with the account does not read the storage again
let pending = false;

export const getAppLanguage = (): AppLanguage =>
  isAppLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;

/** A language picked in the switcher that still has to reach the account. */
export const hasPendingLanguageChoice = (): boolean => pending;

const readStored = async (): Promise<IStoredLanguage | null> => {
  try {
    const raw = await AsyncStorage.getItem(LANGUAGE_KEY);
    const stored = raw ? JSON.parse(raw) : null;
    return isAppLanguage(stored?.language)
      ? { language: stored.language, pending: stored.pending === true }
      : null;
  } catch {
    return null;
  }
};

const store = async (language: AppLanguage, isPending: boolean): Promise<void> => {
  pending = isPending;
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, JSON.stringify({ language, pending: isPending }));
  } catch {
    // at worst the choice is asked again on the next start
  }
};

/** English phones get English; every other language gets Romanian. */
export const deviceLanguage = (): AppLanguage => {
  try {
    return getLocales()[0]?.languageCode === 'en' ? 'en' : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

const isExistingInstall = async (): Promise<boolean> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys.some(
      (key) =>
        EXISTING_INSTALL_KEYS.includes(key) ||
        EXISTING_INSTALL_PREFIXES.some((prefix) => key.startsWith(prefix)),
    );
  } catch {
    // unreadable storage: stay on what everyone had until now
    return true;
  }
};

/**
 * Runs once at start, while the splash screen is up and before anything else writes to the storage:
 * 1. the saved language;
 * 2. an app that was already installed stays in Romanian until its user picks another language;
 * 3. a new install follows the phone.
 * The result is saved, so a later change of the phone's language does not move the app.
 */
export const resolveInitialLanguage = async (): Promise<AppLanguage> => {
  let language: AppLanguage = DEFAULT_LANGUAGE;
  try {
    const stored = await readStored();
    if (stored) {
      language = stored.language;
      pending = stored.pending;
    } else {
      language = (await isExistingInstall()) ? DEFAULT_LANGUAGE : deviceLanguage();
      await store(language, false);
    }
    if (i18n.language !== language) {
      await i18n.changeLanguage(language);
    }
  } catch {
    // never keeps the app on the splash screen
  }
  return language;
};

/**
 * Changes the language of the app now and remembers it. `explicit` marks a choice made in the
 * switcher: it wins over the account's language until the account has received it.
 */
export const applyLanguage = async (language: AppLanguage, explicit: boolean): Promise<void> => {
  if (i18n.language !== language) {
    await i18n.changeLanguage(language);
  }
  await store(language, explicit);
};

/** The account now has the language of this device. */
export const markLanguageSynced = (): Promise<void> => store(getAppLanguage(), false);

/** Only for tests: forget what is kept in memory. */
export const resetLanguageState = (): void => {
  pending = false;
};
