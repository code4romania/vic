import { format, isValid, parse } from 'date-fns';
import { enUS, ro } from 'date-fns/locale';
import i18n from '../config/i18n';
import { shortMonth } from './event-format';

const locale = () => (i18n.language === 'en' ? enUS : ro);

/** The mobile API sends log dates as "08.11.2026" and approval dates as "28/10/2026". */
export const parseLogDate = (value?: string | null): Date | undefined => {
  if (!value) {
    return undefined;
  }
  for (const pattern of ['dd.MM.y', 'dd/MM/y', 'yyyy-MM-dd']) {
    const parsed = parse(value, pattern, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }
  const fallback = new Date(value);
  return isValid(fallback) ? fallback : undefined;
};

/** "8 nov" for a row; the raw text when it cannot be read. */
export const formatLogShortDay = (value?: string | null) => {
  const date = parseLogDate(value);
  return date ? `${format(date, 'd')} ${shortMonth(date)}` : value || '';
};

/** "8 noiembrie 2026" for the detail page. */
export const formatLogLongDay = (value?: string | null) => {
  const date = parseLogDate(value);
  return date ? format(date, 'd MMMM y', { locale: locale() }) : value || '';
};
