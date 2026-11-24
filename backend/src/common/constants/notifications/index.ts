import { Language } from 'src/modules/user/enums/user.enum';
import { EN } from './notifications.en';
import { NotificationTexts, RO } from './notifications.ro';

export { NotificationTexts } from './notifications.ro';

// The texts of the push notifications and of the notification emails, per language.
export const NOTIFICATIONS: Record<Language, NotificationTexts> = {
  [Language.RO]: RO,
  [Language.EN]: EN,
};

// The same on every phone: the app's name.
export const PUSH_TITLE = 'VIC';

export type Localized<T> = Record<Language, T>;

// One text in every language; the sender picks the recipient's.
// localized((t) => t.NEW_EVENT.PUSH.body(organizationName))
export const localized = <T>(
  pick: (texts: NotificationTexts) => T,
): Localized<T> => ({
  [Language.RO]: pick(RO),
  [Language.EN]: pick(EN),
});
