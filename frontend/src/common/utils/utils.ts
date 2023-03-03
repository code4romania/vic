import { differenceInYears, format } from 'date-fns';
import { ICity } from '../interfaces/city.interface';
import { IAnnouncement } from '../interfaces/announcement.interface';

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export const formatDate = (value: Date | string | null): string =>
  value ? format(new Date(value), 'dd/LL/y') : '-';

export const formatDateWithTime = (value: Date | string | null): string =>
  value ? `${new Date(value).toLocaleString()}` : '-';

export const calculateAge = (birthday: Date) => {
  return differenceInYears(new Date(), birthday);
};

export const mapTargetsToString = (announcement: IAnnouncement) => {
  return `(${announcement.targetedVolunteers}) ${announcement.targets.map(
    (target) => ` ${target.name}`,
  )}`;
};

export const formatLocation = (location: ICity): string =>
  location ? `${location.name}, ${location.county?.abbreviation}` : '-';
