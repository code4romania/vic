import { format } from 'date-fns';
import { ButtonType } from '../enums/button-type.enum';

export const ButtonBackgroundColorMapper = {
  [ButtonType.DANGER]: 'color-danger-500',
  [ButtonType.PRIMARY]: 'color-primary-500',
  [ButtonType.SECONDARY]: 'background-basic-color-1',
};

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
