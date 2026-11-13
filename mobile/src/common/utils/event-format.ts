import { differenceInMinutes, format, isSameDay } from 'date-fns';
import { enUS, ro } from 'date-fns/locale';
import i18n from '../config/i18n';

const locale = () => (i18n.language === 'en' ? enUS : ro);

// date-fns abbreviates November as "noi." in Romanian; the canvas and most apps use "nov".
const RO_SHORT_MONTHS = [
  'ian',
  'feb',
  'mar',
  'apr',
  'mai',
  'iun',
  'iul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

/** "nov" (ro) or "Nov" (en), without a dot. */
export const shortMonth = (value: string | Date) =>
  i18n.language === 'en'
    ? format(new Date(value), 'MMM', { locale: enUS })
    : RO_SHORT_MONTHS[new Date(value).getMonth()];

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** "Sâm, 22 nov" */
export const formatShortDay = (value: string | Date) =>
  capitalize(
    `${format(new Date(value), 'EEE', { locale: locale() }).replace('.', '')}, ${format(
      new Date(value),
      'd',
    )} ${shortMonth(value)}`,
  );

/** "Sâmbătă, 22 noiembrie" */
export const formatLongDay = (value: string | Date) =>
  capitalize(format(new Date(value), 'EEEE, d MMMM', { locale: locale() }));

/** "09:00" */
export const formatTime = (value: string | Date) => format(new Date(value), 'HH:mm');

/** "13 nov" for the right of an event row (shown as „13 NOV” in overline); '' without a date. */
export const formatDayMonth = (value?: string | Date | null) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : `${format(date, 'd')} ${shortMonth(date)}`;
};

/** Day number and short month for the date tile: { day: '22', month: 'NOV' }. */
export const dateTile = (value: string | Date) => ({
  day: format(new Date(value), 'd'),
  month: shortMonth(value).toUpperCase(),
});

/** One line for a card: "Sâm, 22 nov · 09:00" (a multi-day event shows "22 nov – 24 nov"). */
export const formatEventWhen = (startDate: string, endDate?: string | null) => {
  if (endDate && !isSameDay(new Date(startDate), new Date(endDate))) {
    return `${formatShortDay(startDate)} – ${formatShortDay(endDate)}`;
  }
  return `${formatShortDay(startDate)} · ${formatTime(startDate)}`;
};

/** "09:00 – 14:00 · 5 ore" for the detail page; empty duration when there is no end. */
export const formatEventSpan = (startDate: string, endDate?: string | null) => {
  if (!endDate) {
    return formatTime(startDate);
  }
  if (!isSameDay(new Date(startDate), new Date(endDate))) {
    return `${formatTime(startDate)} – ${formatShortDay(endDate)}, ${formatTime(endDate)}`;
  }
  const hours =
    Math.round((differenceInMinutes(new Date(endDate), new Date(startDate)) / 60) * 2) / 2;
  const duration =
    hours > 0
      ? ` · ${i18n.t(hours === 1 ? 'events:duration_one' : 'events:duration', { hours })}`
      : '';
  return `${formatTime(startDate)} – ${formatTime(endDate)}${duration}`;
};

/**
 * When something was posted: "Azi, 14:30", "Ieri, 09:05", "12 nov, 14:30", "12 nov 2025" for an
 * older year. Empty for a missing or invalid date (older backends do not send it).
 */
export const formatPostedAt = (value?: string | Date | null, now: Date = new Date()): string => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (isSameDay(date, now)) {
    return `${i18n.t('general:today')}, ${formatTime(date)}`;
  }
  if (isSameDay(date, yesterday)) {
    return `${i18n.t('general:yesterday')}, ${formatTime(date)}`;
  }
  if (date.getFullYear() !== now.getFullYear()) {
    return `${format(date, 'd')} ${shortMonth(date)} ${date.getFullYear()}`;
  }
  return `${format(date, 'd')} ${shortMonth(date)}, ${formatTime(date)}`;
};
