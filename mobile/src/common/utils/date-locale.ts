import { enGB, ro } from 'date-fns/locale';
import i18n from '../config/i18n';

/**
 * Month and weekday names in the app's language. The order of a date (day first) and the 24-hour
 * clock are the same in both languages, so English uses the British locale.
 */
export const dateLocale = (): Locale => (i18n.language === 'en' ? enGB : ro);

/** For toLocaleUpperCase / localeCompare: "ro-RO" or "en-GB". */
export const localeTag = (): string => (i18n.language === 'en' ? 'en-GB' : 'ro-RO');
