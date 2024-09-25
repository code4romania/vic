/* eslint-disable @typescript-eslint/no-explicit-any */
import { endOfDay, format, formatISO9075, isSameDay } from 'date-fns';
import { SelectItem } from '../../components/Select';
import { ActivityLogStatus } from '../enums/activity-log.status.enum';
import { ICity } from '../interfaces/city.interface';
import { IDivisionListItem } from '../interfaces/division.interface';
import { AnnouncementStatus } from '../enums/announcement-status.enum';
import { VolunteerStatus } from '../enums/volunteer-status.enum';
import { EventStatus } from '../enums/event-status';
import { ListItem } from '../interfaces/list-item.interface';
import { AgeRangeEnum } from '../enums/age-range.enum';
import { ContractStatus } from '../enums/contract-status.enum';
import {
  ApprovedDocumentContractStatus,
  DocumentContractStatus,
} from '../enums/document-contract-status.enum';

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

export const formatDate = (value?: Date | string | null, dateFormat?: string): string =>
  value ? format(new Date(value), dateFormat || 'dd.LL.y') : '-';

export const formatDateWithTime = (value?: Date | string | null): string =>
  value ? format(new Date(value), 'dd.LL.y HH:mm') : '-';

export const arrayOfNamesToString = (array: { name: string }[], separator: string): string => {
  return array.map((item) => item.name).join(separator);
};

export const formatLocation = (location: ICity): string =>
  location ? `${location.name}, ${location.county?.abbreviation}` : '-';

export const getHoursAndMinutes = (value: Date | string): string =>
  format(new Date(value), 'HH:mm');

export const formatEventDate = (startDate: Date, endDate?: Date): string => {
  let eventDate = '';
  if (!endDate) {
    eventDate = `${formatDate(startDate)}, ${getHoursAndMinutes(startDate)}`;
  } else {
    if (isSameDay(new Date(startDate), new Date(endDate))) {
      eventDate = `${formatDate(startDate)}, ${getHoursAndMinutes(
        startDate,
      )}-\n${getHoursAndMinutes(endDate)}`;
    } else {
      eventDate = `${formatDate(startDate)}, ${getHoursAndMinutes(startDate)}-\n${formatDate(
        endDate,
      )}, ${getHoursAndMinutes(endDate)}`;
    }
  }

  return eventDate;
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
  link.setAttribute('target', '_blank');
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
  [VolunteerStatus.ARCHIVED]: 'text-yellow-600',
  [VolunteerStatus.BLOCKED]: 'text-red-600',
};

export const AnouncementStatusMarkerColorMapper = {
  [AnnouncementStatus.PUBLISHED]: 'bg-green-500',
  [AnnouncementStatus.DRAFT]: 'bg-yellow-500',
};

export const EventStatusMarkerColorMapper = {
  [EventStatus.DRAFT]: 'bg-yellow-500',
  [EventStatus.PUBLISHED]: 'bg-green-500',
  [EventStatus.ARCHIVED]: 'bg-red-500',
};

export const ContractStatusMarkerColorMapper = {
  [ContractStatus.ACTIVE]: 'bg-green-500',
  [ContractStatus.CLOSED]: 'bg-cool-gray-800',
  [ContractStatus.NOT_STARTED]: 'bg-blue-500',
  [ContractStatus.PENDING_ADMIN]: 'bg-yellow-500',
  [ContractStatus.PENDING_VOLUNTEER]: 'bg-yellow-500',
  [ContractStatus.REJECTED]: 'bg-red-500',
};

export const ApprovedDocumentContractStatusMapper = {
  [ApprovedDocumentContractStatus.ACTIVE]: 'bg-green-500',
  [ApprovedDocumentContractStatus.DONE]: 'bg-black',
  [ApprovedDocumentContractStatus.NOT_STARTED]: 'bg-blue-500',
};

export const DocumentContractStatusMarkerColorMapper = {
  [DocumentContractStatus.CREATED]: 'bg-purple-500',
  [DocumentContractStatus.SCHEDULED]: 'bg-blue-500',
  [DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE]: 'bg-yellow-500',
  [DocumentContractStatus.PENDING_APPROVAL_NGO]: 'bg-yellow-500',
  [DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE]: 'bg-yellow-500',
  [DocumentContractStatus.APPROVED]: 'bg-green-500',
  [DocumentContractStatus.REJECTED_VOLUNTEER]: 'bg-red-500',
  [DocumentContractStatus.REJECTED_NGO]: 'bg-red-500',
  [DocumentContractStatus.ACTION_EXPIRED]: 'bg-red-500',
};

export const ActivityLogStatusMarkerColorMapper = {
  [ActivityLogStatus.APPROVED]: 'bg-green-500',
  [ActivityLogStatus.REJECTED]: 'bg-red-500',
  [ActivityLogStatus.PENDING]: 'bg-yellow-500',
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
