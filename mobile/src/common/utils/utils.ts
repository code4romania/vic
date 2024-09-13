import { differenceInYears, format, parseISO } from 'date-fns';
import { ActivityLogStatus } from '../enums/activity-log.status.enum';

export const formatDate = (value?: Date | string | null): string =>
  value ? format(new Date(value), 'dd/LL/y') : '-';

export function JSONStringifyError(value: Error): string {
  if (value instanceof Error) {
    const error: Record<string, unknown> = {};
    Object.getOwnPropertyNames(value).forEach(function (propName) {
      error[propName as keyof Error] = value[propName as keyof Error];
    });
    return JSON.stringify(error);
  }
  return JSON.stringify(value);
}

export const ActivityLogStatusToColorMapper = {
  [ActivityLogStatus.APPROVED]: 'green',
  [ActivityLogStatus.PENDING]: 'yellow',
  [ActivityLogStatus.REJECTED]: 'red',
};

export const isOver16 = (birthday: string | Date) => {
  const birthdayDate = typeof birthday === 'string' ? parseISO(birthday) : birthday;
  const today = new Date();
  const age = differenceInYears(today, birthdayDate);
  return age >= 16;
};
