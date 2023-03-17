import { differenceInYears, format, isSameDay } from 'date-fns';
import { SelectItem } from '../../components/Select';
import { ActivityLogStatus } from '../enums/activity-log.status.enum';
import { ICity } from '../interfaces/city.interface';
import { IDivisionListItem } from '../interfaces/division.interface';
import { AnnouncementStatus } from '../enums/announcement-status.enum';
import { EventStatus } from '../enums/event-status';
import { IUser } from '../interfaces/user.interface';
import { ListItem } from '../interfaces/list-item.interface';

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * FORMATTERS
 */

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

export const getHoursAndMinutes = (value: Date | string): string =>
  format(new Date(value), 'hh:mm');

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

/**
 * MAPPERS
 */

export const AnouncementStatusMarkerColorMapper = {
  [AnnouncementStatus.PUBLISHED]: 'bg-green-500',
  [AnnouncementStatus.DRAFT]: 'bg-yellow-500',
};

export const EventStatusMarkerColorMapper = {
  [EventStatus.DRAFT]: 'bg-yellow-500',
  [EventStatus.PUBLISHED]: 'bg-green-500',
  [EventStatus.ARCHIVED]: 'bg-red-500',
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

export const mapUserToListItem = (user: Pick<IUser, 'id' | 'name'>): ListItem => ({
  label: user.name,
  value: user.id,
});
