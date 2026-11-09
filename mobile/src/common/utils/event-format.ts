import { differenceInMinutes, format, isSameDay } from 'date-fns';
import { enUS, ro } from 'date-fns/locale';
import i18n from '../config/i18n';

const locale = () => (i18n.language === 'en' ? enUS : ro);

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** "Sâm, 22 nov" */
export const formatShortDay = (value: string | Date) =>
  capitalize(format(new Date(value), 'EEE, d MMM', { locale: locale() }).replace('.', ''));

/** "Sâmbătă, 22 noiembrie" */
export const formatLongDay = (value: string | Date) =>
  capitalize(format(new Date(value), 'EEEE, d MMMM', { locale: locale() }));

/** "09:00" */
export const formatTime = (value: string | Date) => format(new Date(value), 'HH:mm');

/** Day number and short month for the date tile: { day: '22', month: 'NOV' }. */
export const dateTile = (value: string | Date) => ({
  day: format(new Date(value), 'd'),
  month: format(new Date(value), 'MMM', { locale: locale() }).replace('.', '').toUpperCase(),
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
