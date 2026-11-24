import i18n from '../../common/config/i18n';
import {
  Language,
  isLanguage,
  readStoredLanguage,
  storeLanguage,
} from '../../common/config/language';
import * as authApi from './auth.api';

export const currentLanguage = (): Language => {
  const language = i18n.resolvedLanguage ?? i18n.language;
  return isLanguage(language) ? language : 'ro';
};

// A language that did not come from the switcher (the account's, or the browser's the first time):
// shown and kept on this browser, so the pages before login use it at the next visit.
const adopt = async (language: Language): Promise<void> => {
  storeLanguage(language, false);
  if (currentLanguage() !== language) await i18n.changeLanguage(language);
};

// Saves a choice made in the switcher on the account. It stays pending on this browser until the API
// confirms, so a failed request is tried again at the next profile load.
const saveChoice = async (language: Language): Promise<void> => {
  try {
    await authApi.setLanguage(language, true);
    // unless the admin picked another language while the request was on its way
    if (readStoredLanguage()?.language === language) storeLanguage(language, false);
  } catch {
    // stays pending
  }
};

// The switcher. The screen changes at once; the account follows when someone is logged in, and at
// the next login otherwise.
export const chooseLanguage = async (
  language: Language,
  isAuthenticated: boolean,
): Promise<void> => {
  storeLanguage(language, true);
  await i18n.changeLanguage(language);
  if (isAuthenticated) await saveChoice(language);
};

// Called with every profile the API returns (page load, login, the tab coming back into view).
//  - a choice made on this browser and not saved yet wins and goes to the account;
//  - else the account's language wins: this is how a change made on another browser arrives here, and
//    how an admin from before VIC was bilingual stays in Romanian;
//  - an account with no language yet takes the one on screen, unless another browser was faster.
// Only the middle case changes what is on screen, so only that one is awaited; the requests of the
// other two run in the background and a failure never stands in the way of the session.
export const syncAccountLanguage = async (accountLanguage?: Language | null): Promise<void> => {
  const stored = readStoredLanguage();
  if (stored?.pending) {
    void saveChoice(stored.language);
    return;
  }

  if (isLanguage(accountLanguage)) {
    await adopt(accountLanguage);
    return;
  }

  void authApi
    .setLanguage(currentLanguage(), false)
    .then(({ language }) =>
      // unless the admin used the switcher while the request was on its way
      isLanguage(language) && !readStoredLanguage()?.pending ? adopt(language) : undefined,
    )
    .catch(() => undefined);
};
