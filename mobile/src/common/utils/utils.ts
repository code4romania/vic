import { format } from 'date-fns';
import { ActivityLogStatus } from '../enums/activity-log.status.enum';

export const applyCardShadow = (theme: any) => ({
  shadowColor: theme['cool-gray-400'],
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2, // android only
});

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
