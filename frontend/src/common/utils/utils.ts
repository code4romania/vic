import { differenceInYears, format, isSameDay } from 'date-fns';
import { ICity } from '../interfaces/city.interface';

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export const formatDate = (value: Date | string): string => format(new Date(value), 'dd/LL/y');
export const formatDotDate = (value: Date | string): string => format(new Date(value), 'dd.LL.y');

export const calculateAge = (birthday: Date) => {
  return differenceInYears(new Date(), birthday);
};

export const formatLocation = (location: ICity): string =>
  location ? `${location.name}, ${location.county?.abbreviation}` : '-';

export const getHoursAndMinutes = (value: Date | string): string =>
  format(new Date(value), 'hh:mm');

export const formatEventDate = (startDate: Date, endDate?: Date): string => {
  return !endDate
    ? `${formatDotDate(startDate)}, ${getHoursAndMinutes(startDate)}`
    : isSameDay(startDate, endDate)
    ? `${formatDotDate(startDate)}, ${getHoursAndMinutes(startDate)}-\n${getHoursAndMinutes(
        endDate,
      )}`
    : `${formatDotDate(startDate)}, ${getHoursAndMinutes(startDate)}-\n${formatDotDate(
        endDate,
      )}, ${getHoursAndMinutes(endDate)}`;
};
