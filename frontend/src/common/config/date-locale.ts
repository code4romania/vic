import { registerLocale } from 'react-datepicker';
import { ro } from 'date-fns/locale/ro';
import { enGB } from 'date-fns/locale/en-GB';
import i18n from './i18n';
import { Language } from './language';

// The calendar's month and weekday names. British English, so both languages keep the same shape:
// the week starts on Monday and dates are day first.
registerLocale('ro', ro);
registerLocale('en', enGB);

// The locale name to hand to a react-datepicker (and to sorting): the language on screen.
export const dateLocale = (): Language => (i18n.resolvedLanguage === 'en' ? 'en' : 'ro');
