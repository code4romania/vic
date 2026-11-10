/* eslint-disable @typescript-eslint/no-explicit-any */
import { endOfDay, format, formatISO9075, isSameDay } from 'date-fns';
import { SelectItem } from '../../components/Select';
import { ICity } from '../interfaces/city.interface';
import { IDivisionListItem } from '../interfaces/division.interface';
import { AnnouncementStatus } from '../enums/announcement-status.enum';
import { VolunteerStatus } from '../enums/volunteer-status.enum';
import { EventStatus } from '../enums/event-status';
import { ListItem } from '../interfaces/list-item.interface';
import { AgeRangeEnum } from '../enums/age-range.enum';
import { ContractStatus } from '../enums/contract-status.enum';

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export const debouncePromise = (fn: any, delay: number) => {
  let timeoutId: any = null;
  return function (...args: any) {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        resolve(fn(...args));
      }, delay);
    });
  };
};

/**
 * FORMATTERS
 */

// What a cell shows when there is no value: always the same dash
export const EMPTY_VALUE = '–';

// One date format everywhere: 14.11.2026
export const formatDate = (value?: Date | string | null, dateFormat?: string): string =>
  value ? format(new Date(value), dateFormat || 'dd.LL.y') : EMPTY_VALUE;

export const formatDateWithTime = (value?: Date | string | null): string =>
  value ? format(new Date(value), 'dd.LL.y, HH:mm') : EMPTY_VALUE;

// "04.05.2026 – 24.08.2026": an en dash, and a line can only break after it, never inside a date
export const formatDateRange = (start?: Date | string | null, end?: Date | string | null): string =>
  `${formatDate(start)}\u00a0– ${formatDate(end)}`;

export const arrayOfNamesToString = (array: { name: string }[], separator: string): string => {
  return array.map((item) => item.name).join(separator);
};

// "-" when there is no city; never the text "null" or "undefined"
export const formatLocation = (location?: ICity | null): string =>
  [location?.name, location?.county?.abbreviation].filter(Boolean).join(', ') || EMPTY_VALUE;

export const getHoursAndMinutes = (value: Date | string): string =>
  format(new Date(value), 'HH:mm');

// "14.11.2026, 18:04 – 23:04" on one day, "14.11.2026, 18:04 – 15.11.2026, 10:00" otherwise.
// Non-breaking spaces keep each date with its hour.
export const formatEventDate = (
  startDate: Date | string,
  endDate?: Date | string | null,
): string => {
  const start = `${formatDate(startDate)},\u00a0${getHoursAndMinutes(startDate)}`;
  if (!endDate) return start;
  const end = isSameDay(new Date(startDate), new Date(endDate))
    ? getHoursAndMinutes(endDate)
    : `${formatDate(endDate)},\u00a0${getHoursAndMinutes(endDate)}`;
  return `${start}\u00a0– ${end}`;
};

export const downloadExcel = (data: BlobPart, name: string): void => {
  const url = URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', name);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadFile = (uri: string, name: string) => {
  const link = document.createElement('a');
  link.href = uri;
  link.setAttribute('download', name);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const formatStartDateISO9075 = (startDate: Date) => formatISO9075(startDate);

export const formatEndDateISO9075 = (endDate: Date) => formatISO9075(endOfDay(endDate));

/**
 * MAPPERS
 */
export const VolunteerProfileStatusTextColorMapper = {
  [VolunteerStatus.ACTIVE]: '',
  [VolunteerStatus.INACTIVE]: 'text-yellow-600',
  [VolunteerStatus.CANDIDATE]: 'text-cool-gray-500',
  [VolunteerStatus.BLOCKED]: 'text-red-600',
};

export const AnouncementStatusMarkerColorMapper = {
  [AnnouncementStatus.ACTIVE]: 'bg-green-500',
  [AnnouncementStatus.INACTIVE]: 'bg-yellow-500',
  [AnnouncementStatus.ARCHIVED]: 'bg-cool-gray-500',
};

export const EventStatusMarkerColorMapper = {
  [EventStatus.DRAFT]: 'bg-yellow-500',
  [EventStatus.PUBLISHED]: 'bg-green-500',
  [EventStatus.ARCHIVED]: 'bg-red-500',
  // computed: a published event past its end date (VIC 2.0)
  finished: 'bg-cool-gray-500',
} as Record<string, string>;

export const ContractStatusMarkerColorMapper = {
  [ContractStatus.SIGNED]: 'bg-green-500',
  [ContractStatus.PENDING]: 'bg-yellow-500',
  [ContractStatus.EXPIRED]: 'bg-cool-gray-800',
};

// Volunteers table (#475)
export const VolunteerStatusMarkerColorMapper: Record<string, string> = {
  active: 'bg-green-500',
  inactive: 'bg-yellow-500',
  candidate: 'bg-navy',
  blocked: 'bg-red-500',
};

export const mapDivisionListItemToSelectItem = (item: IDivisionListItem): SelectItem<string> => ({
  key: item.id,
  value: item.name,
});

export const mapUserToListItem = (item: IDivisionListItem): ListItem => ({
  label: item.name,
  value: item.id,
});

export const AgeRangeOptions: SelectItem<AgeRangeEnum>[] = [
  {
    key: AgeRangeEnum['0_18'],
    value: '0-18',
  },
  {
    key: AgeRangeEnum['18_30'],
    value: '18-30',
  },
  {
    key: AgeRangeEnum['30_50'],
    value: '30-50',
  },
  {
    key: AgeRangeEnum.OVER_50,
    value: '>50',
  },
];
