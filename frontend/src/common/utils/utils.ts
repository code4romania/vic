import { differenceInYears, format } from 'date-fns';
import { ICity } from '../interfaces/city.interface';

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export const formatDate = (value: Date | string): string => format(new Date(value), 'dd/LL/y');

export const calculateAge = (birthday: Date) => {
  return differenceInYears(new Date(), birthday);
};

export const formatLocation = (location: ICity): string =>
  location ? `${location.name}, ${location.county?.abbreviation}` : '-';

export const triggerDownload = (url: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download;
  document.body.appendChild(link);
  link.click();
  link?.parentNode?.removeChild(link);
};
