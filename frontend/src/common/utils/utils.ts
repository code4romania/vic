// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { format } from 'date-fns';

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const formatDate = (value: Date | string): string => format(new Date(value), 'd/L/y');
