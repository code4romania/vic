import { format, isSameDay } from 'date-fns';

export const formatEventDate = (startDate: Date, endDate?: Date): string => {
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

const getHoursAndMinutes = (value: Date | string): string =>
  format(new Date(value), 'HH:mm');
