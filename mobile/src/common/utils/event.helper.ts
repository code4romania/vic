import { format, isSameDay } from 'date-fns';

/**
 * Formats the start and end date of an event into a human-readable string.
 *
 * @param {string} startDate - The start date of the event in ISO string format.
 * @param {string} [endDate] - The optional end date of the event in ISO string format.
 * @returns {string} - A formatted string representing the event's date and time.
 *
 * @example
 * const formattedDate = formatEventDate("2024-07-15T07:45:00Z");
 * 👀 Returns: "15 Jul 2024, 07:45" (considering the user is in Timezone +0, if RO there will be +2/3)
 *
 * @example
 * const formattedDateWithEnd = formatEventDate("2024-07-15T07:45:00Z", "2024-07-15T09:45:00Z");
 * 👀  Returns: "15 Jul 2024, 07:45 - 09:45"
 *
 * @example
 * const formattedDateDifferentDays = formatEventDate("2024-07-15T07:45:00Z", "2024-07-16T09:45:00Z");
 * 👀  Returns: "15 Jul 2024, 07:45 - 16 Jul 2024, 09:45"
 */
export const formatEventDate = (startDate: string, endDate?: string): string => {
  if (!startDate && !endDate) {
    return '-';
  }
  // HERE
  let eventDate = '';
  if (!endDate) {
    eventDate = `${formatDate(startDate)}, ${getHoursAndMinutes(startDate)}`;
  } else {
    if (isSameDay(new Date(startDate), new Date(endDate))) {
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

const formatDate = (value?: Date | string | null): string =>
  value ? format(new Date(value), 'dd MMM yyyy') : '-';

const getHoursAndMinutes = (value: Date | string): string => format(new Date(value), 'HH:mm');
