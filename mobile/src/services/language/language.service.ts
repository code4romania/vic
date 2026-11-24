import {
  AppLanguage,
  applyLanguage,
  getAppLanguage,
  hasPendingLanguageChoice,
  isAppLanguage,
  markLanguageSynced,
} from '../../common/config/language';
import useStore from '../../store/store';
import { setUserLanguage } from '../user/user.api';

const STALE_PROFILE_MS = 5000;
let ignoreAccountUntil = 0;

// Sends the app's language to the account. `explicit` (a choice made in the switcher) overwrites
// what the account has; otherwise the backend only fills an account with no language and answers
// with what it keeps. A failure changes nothing: an explicit choice stays pending and goes again
// with the next profile load.
const pushToAccount = async (explicit: boolean): Promise<void> => {
  const sent = getAppLanguage();
  try {
    const { language } = await setUserLanguage(sent, explicit);
    if (explicit) {
      // unless the user switched again while the request was on its way
      if (getAppLanguage() === sent) {
        await markLanguageSynced();
        // a profile requested before this answer may still arrive with the old language
        ignoreAccountUntil = Date.now() + STALE_PROFILE_MS;
      }
    } else if (
      isAppLanguage(language) &&
      language !== getAppLanguage() &&
      !hasPendingLanguageChoice()
    ) {
      await applyLanguage(language, false);
    }
    const { userProfile, setUserProfile } = useStore.getState();
    if (userProfile && isAppLanguage(language) && userProfile.language !== language) {
      setUserProfile({ ...userProfile, language });
    }
  } catch {
    // offline, or the profile does not exist yet (CreateUser): the next profile load tries again
  }
};

/**
 * After the profile loads (login, app start, refresh):
 * - a choice made in the switcher on this device that the account does not have yet wins;
 * - otherwise the account's language wins, so a change made on another device arrives here;
 * - an account with no language yet takes the language the app is in.
 * Resolves as soon as the app is in the right language; the request to the backend runs on its own.
 */
export const syncLanguageWithAccount = async (
  accountLanguage?: AppLanguage | null,
): Promise<void> => {
  if (hasPendingLanguageChoice()) {
    pushToAccount(true);
    return;
  }
  if (isAppLanguage(accountLanguage)) {
    if (accountLanguage !== getAppLanguage() && Date.now() >= ignoreAccountUntil) {
      await applyLanguage(accountLanguage, false);
    }
    return;
  }
  pushToAccount(false);
};

/** Only for tests: forget that a choice was just sent. */
export const resetLanguageSync = (): void => {
  ignoreAccountUntil = 0;
};

/** The switcher: the app changes at once; the account follows when there is a profile. */
export const chooseLanguage = async (language: AppLanguage): Promise<void> => {
  await applyLanguage(language, true);
  if (useStore.getState().userProfile) {
    await pushToAccount(true);
  }
};
