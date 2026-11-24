// The languages VIC speaks. The choice lives in three places: this browser (localStorage, for the
// pages before login), the admin's account (so emails follow it, and so do their other browsers)
// and i18next (what is on screen).
export type Language = 'ro' | 'en';

export const LANGUAGES: Language[] = ['ro', 'en'];
export const DEFAULT_LANGUAGE: Language = 'ro';

// Each language under its own name, as the switcher shows it.
export const LANGUAGE_NAMES: Record<Language, string> = {
  ro: 'Română',
  en: 'English',
};

export const LANGUAGE_STORAGE_KEY = 'vic.language';

export interface StoredLanguage {
  language: Language;
  // Picked in the switcher on this browser and not saved on the account yet: it wins over the
  // account's language at the next profile load. A language taken from the account or from the
  // browser is never pending.
  pending: boolean;
}

export const isLanguage = (value: unknown): value is Language =>
  LANGUAGES.includes(value as Language);

// A browser can refuse localStorage (private mode, blocked site data): the app then follows the
// browser's language on every visit.
export const readStoredLanguage = (): StoredLanguage | null => {
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredLanguage>;
    if (!isLanguage(parsed?.language)) return null;
    return { language: parsed.language, pending: parsed.pending === true };
  } catch {
    return null;
  }
};

export const storeLanguage = (language: Language, pending: boolean): void => {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify({ language, pending }));
  } catch {
    // nowhere to keep it: the choice lasts for this visit
  }
};

// English for a browser set to English, Romanian for every other language.
export const detectBrowserLanguage = (): Language =>
  (window.navigator?.language || '').toLowerCase().startsWith('en') ? 'en' : DEFAULT_LANGUAGE;

// What the app starts in: the language kept on this browser, else the browser's own.
export const initialLanguage = (): Language =>
  readStoredLanguage()?.language ?? detectBrowserLanguage();
