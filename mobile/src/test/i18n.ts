import i18n from '../common/config/i18n';
import { getLocales } from 'expo-localization';
import { shortMonth } from '../common/utils/event-format';

/**
 * The text of a translation key in the language the test runs in: `t('settings:logout')`.
 * Tests look texts up with it instead of spelling them out, so they pass in every language
 * (`TEST_LANG=en npm test`).
 */
export const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(key, options as any)}`;

/** A pattern for a text that is only a part of what is on screen: `getByText(containing(t(...)))`. */
export const containing = (text: string): RegExp =>
  new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

/** The language the suite runs in: Romanian, or the one in TEST_LANG. */
export const TEST_LANGUAGE: 'ro' | 'en' = process.env.TEST_LANG === 'en' ? 'en' : 'ro';

/**
 * For the few texts that are not a translation key (a weekday or a month written by the date
 * library): the expected value in each language, spelled out.
 */
export const byLanguage = <T>(values: { ro: T; en: T }): T => values[TEST_LANGUAGE];

/** The short name of a month (0 = January) in the language the test runs in: "ian" / "Jan". */
export const shortMonthName = (month: number): string => shortMonth(new Date(2026, month, 15));

/** Runs the callback with the app in a language, then puts the test language back. */
export const inLanguage = async <T>(
  language: 'ro' | 'en',
  run: () => T | Promise<T>,
): Promise<T> => {
  const before = i18n.language;
  await i18n.changeLanguage(language);
  try {
    return await run();
  } finally {
    await i18n.changeLanguage(before);
  }
};

/** What the phone reports as its language (expo-localization is mocked in setup.ts). */
export const mockDeviceLanguage = (languageCode: string | null): void => {
  (getLocales as jest.Mock).mockReturnValue(
    languageCode ? [{ languageCode, languageTag: languageCode }] : [],
  );
};
