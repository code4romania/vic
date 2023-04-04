/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { differenceInYears, endOfDay, format, formatISO9075, isSameDay } from 'date-fns';
import { SelectItem } from '../../components/Select';
import { ActivityLogStatus } from '../enums/activity-log.status.enum';
import { ICity } from '../interfaces/city.interface';
import { IDivisionListItem } from '../interfaces/division.interface';
import { AnnouncementStatus } from '../enums/announcement-status.enum';
import { VolunteerStatus } from '../enums/volunteer-status.enum';
import { EventStatus } from '../enums/event-status';
import { ListItem } from '../interfaces/list-item.interface';
import { TrackedEventName } from '../enums/actions.enum';
import { IEventData } from '../interfaces/action.interface';
import { Trans } from 'react-i18next';
import i18n from '../config/i18n';
import { LinkText } from '../../components/LinkText';

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

export const mapEventDataToActionDescription = (
  eventName: TrackedEventName,
  eventData: IEventData,
  changes: { name?: { original: string; updated: string } },
): React.ReactNode => {
  switch (eventName) {
    //Organization Structure
    case TrackedEventName.UPDATE_ORGANIZATION_PROFILE:
      return (
        <Trans
          i18nKey={`actions_archive:${eventName}.description`}
          components={{
            inlineLink: <LinkText url={'/organization'} content={eventData.organizationName} />,
          }}
        />
      );
    case TrackedEventName.CREATE_ORGANIZATION_STRUCTURE:
      return (
        <Trans
          i18nKey={`actions_archive:${eventName}.${eventData.organizationStructureType}`}
          components={{
            inlineLink: (
              <LinkText url={'/organization'} content={eventData.organizationStructureName} />
            ),
          }}
        />
      );
    case TrackedEventName.UPDATE_ORGANIZATION_STRUCTURE:
      return (
        <Trans
          i18nKey={`actions_archive:${eventName}.${eventData.organizationStructureType}`}
          components={{
            inlineLink: <LinkText url={'/organization'} content={changes.name?.updated} />,
          }}
          values={{ organizationStructureNameInitial: changes.name?.original }}
        />
      );
    case TrackedEventName.DELETE_ORGANIZATION_STRUCTURE:
      return `${i18n.t(`actions_archive:${eventName}.${eventData.organizationStructureType}`, {
        ...eventData,
      })}`;

    //Access Requests
    case TrackedEventName.APPROVE_ACCESS_REQUEST:
    case TrackedEventName.REJECT_ACCESS_REQUEST:
    case TrackedEventName.DELETE_ACCESS_REQUEST:
      return (
        <Trans
          i18nKey={`actions_archive:${eventName}.description`}
          components={{
            inlineLink: (
              <LinkText url={`/volunteers/${eventData.volunteerId}`} content={eventData.userName} />
            ),
          }}
        />
      );

    //Volunteers
    case TrackedEventName.CHANGE_VOLUNTEER_STATUS:
      return (
        <Trans
          i18nKey={`actions_archive:${eventName}.description`}
          components={{
            inlineLink: (
              <LinkText
                url={`/volunteers/${eventData.volunteerId}`}
                content={eventData.volunteerName}
              />
            ),
          }}
          values={{
            oldStatus: i18n.t(`volunteer:status.${eventData.oldStatus}`),
            newStatus: i18n.t(`volunteer:status.${eventData.newStatus}`),
          }}
        />
      );
    case TrackedEventName.UPDATE_VOLUNTEER_PROFILE:
      return (
        <Trans
          i18nKey={`actions_archive:${eventName}.description`}
          components={{
            inlineLink: (
              <LinkText
                url={`/volunteers/${eventData.volunteerId}`}
                content={eventData.volunteerName}
              />
            ),
          }}
        />
      );

    //Activity Log
    case TrackedEventName.REGISTER_ACTIVITY_LOG:
      return (
        <Trans
          i18nKey={`actions_archive:${eventName}.description`}
          components={{
            inlineLink: (
              <LinkText
                url={`/volunteers/${eventData.volunteerId}`}
                content={eventData.volunteerName}
              />
            ),
          }}
        />
      );
    case TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS:
      return (
        <Trans
          i18nKey={`actions_archive:${eventName}.${eventData.newStatus}`}
          components={{
            inlineLink: (
              <LinkText
                url={`/volunteers/${eventData.volunteerId}`}
                content={eventData.volunteerName}
              />
            ),
          }}
        />
      );

    // Activity Type
    case TrackedEventName.CREATE_ACTIVITY_TYPE:
    case TrackedEventName.UPDATE_ACTIVITY_TYPE:
      return (
        <Trans
          i18nKey={`actions_archive:${eventName}.description`}
          components={{
            inlineLink: (
              <LinkText
                url={`/activity-types/edit/${eventData.activityTypeId}`}
                content={eventData.activityTypeName}
              />
            ),
          }}
        />
      );
    case TrackedEventName.CHANGE_ACTIVITY_TYPE_STATUS:
      return (
        <Trans
          i18nKey={`actions_archive:${eventName}.description`}
          components={{
            inlineLink: (
              <LinkText
                url={`/activity-types/edit/${eventData.activityTypeId}`}
                content={eventData.activityTypeName}
              />
            ),
          }}
          values={{
            oldStatus: i18n.t(`volunteer:status.${eventData.oldStatus}`),
            newStatus: i18n.t(`volunteer:status.${eventData.newStatus}`),
          }}
        />
      );
    // Events
    case TrackedEventName.CREATE_EVENT:
    case TrackedEventName.UPDATE_EVENT:
      return (
        <Trans
          i18nKey={`actions_archive:${eventName}.description`}
          components={{
            inlineLink: (
              <LinkText url={`/events/${eventData.eventId}`} content={eventData.eventName} />
            ),
          }}
        />
      );
    case TrackedEventName.DELETE_EVENT:
      return `${i18n.t(`actions_archive:${eventName}.description`, {
        ...eventData,
      })}`;
    case TrackedEventName.CHANGE_EVENT_STATUS:
      return (
        <Trans
          i18nKey={`actions_archive:${eventName}.description`}
          components={{
            inlineLink: (
              <LinkText url={`/events/${eventData.eventId}`} content={eventData.eventName} />
            ),
          }}
          values={{
            oldStatus: i18n.t(`events:display_status.${eventData.oldStatus}`).toLowerCase(),
            newStatus: i18n.t(`events:display_status.${eventData.newStatus}`).toLowerCase(),
          }}
        />
      );

    // Announcements
    case TrackedEventName.CREATE_ANNOUNCEMENT:
    case TrackedEventName.PUBLISH_ANNOUNCEMENT:
      return (
        <Trans
          i18nKey={`actions_archive:${eventName}.description`}
          components={{
            inlineLink: (
              <LinkText
                url={`/announcements/${eventData.announcementId}`}
                content={eventData.announcementTitle}
              />
            ),
          }}
        />
      );
    case TrackedEventName.DELETE_ANNOUNCEMENT:
      return `${i18n.t(`actions_archive:${eventName}.description`, {
        ...eventData,
      })}`;

    default:
      return '-';
  }
};
