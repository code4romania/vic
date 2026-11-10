import { APP_TIME_ZONE, bucharestDay } from 'src/common/helpers/bucharest-time';

// The event's date and time as the app shows them, in Romania's time whatever the server's zone:
// "20 Nov 2026, 16:00 - 18:00", or both days when it spans more than one.
export const formatEventDate = (startDate: Date, endDate?: Date): string => {
  let eventDate = '';
  if (!endDate) {
    eventDate = `${formatDate(startDate)}, ${getHoursAndMinutes(startDate)}`;
  } else {
    if (bucharestDay(new Date(startDate)) === bucharestDay(new Date(endDate))) {
      eventDate = `${formatDate(startDate)}, ${getHoursAndMinutes(
        startDate,
      )} - ${getHoursAndMinutes(endDate)}`;
    } else {
      eventDate = `${formatDate(startDate)}, ${getHoursAndMinutes(
        startDate,
      )} - ${formatDate(endDate)}, ${getHoursAndMinutes(endDate)}`;
    }
  }

  return eventDate;
};

const dateParts = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIME_ZONE,
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const formatDate = (value?: Date | string | null): string => {
  if (!value) return '-';
  const parts = Object.fromEntries(
    dateParts.formatToParts(new Date(value)).map((p) => [p.type, p.value]),
  );
  return `${parts.day} ${parts.month} ${parts.year}`;
};

const getHoursAndMinutes = (value: Date | string): string =>
  timeFormat.format(new Date(value));
