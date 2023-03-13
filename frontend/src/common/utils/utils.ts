import { differenceInYears, format } from 'date-fns';
import { SelectItem } from '../../components/Select';
import { ActivityLogStatus } from '../enums/activity-log.status.enum';
import { ICity } from '../interfaces/city.interface';
import { IDivisionListItem } from '../interfaces/division.interface';

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export const formatDate = (value?: Date | string | null): string =>
  value ? format(new Date(value), 'dd.LL.y') : '-';

export const formatDateWithTime = (value?: Date | string | null): string =>
  value ? format(new Date(value), 'dd.LL.y hh:mm') : '-';

export const calculateAge = (birthday: Date) => {
  return differenceInYears(new Date(), birthday);
};

export const arrayOfNamesToString = (array: { name: string }[], separator: string): string => {
  return array.map((item) => item.name).join(separator);
};

export const formatLocation = (location: ICity): string =>
  location ? `${location.name}, ${location.county?.abbreviation}` : '-';

export const mapDivisionListItemToSelectItem = (item: IDivisionListItem): SelectItem<string> => ({
  key: item.id,
  value: item.name,
});

export const downloadExcel = (data: BlobPart, name: string): void => {
  const url = URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', name);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const ActivityLogStatusMarkerColorMapper = {
  [ActivityLogStatus.APPROVED]: 'bg-green-500',
  [ActivityLogStatus.REJECTED]: 'bg-red-500',
  [ActivityLogStatus.PENDING]: 'bg-yellow-500',
};
