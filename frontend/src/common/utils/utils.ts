import { differenceInYears, format } from 'date-fns';

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export const formatDate = (value: Date | string): string => format(new Date(value), 'dd/LL/y');

export const calculateAge = (birthday: Date) => {
  return differenceInYears(new Date(), birthday);
};
