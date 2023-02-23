import { differenceInYears, format } from 'date-fns';

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export const formatDate = (value: Date | string | null): string =>
  value ? format(new Date(value), 'd/L/y') : '-';

export const calculateAge = (birthday: Date) => {
  return differenceInYears(new Date(), birthday);
};
