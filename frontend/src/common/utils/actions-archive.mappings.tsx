import React from 'react';
import { TrackedEventName } from '../enums/actions.enum';
import { IEventData } from '../interfaces/action.interface';
import { Trans } from 'react-i18next';
import i18n from '../config/i18n';
import { LinkText } from '../../components/LinkText';

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
    case TrackedEventName.CREATE_CONTRACT:
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
    case TrackedEventName.APPROVE_CONTRACT:
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
            inlineContractLink: (
              <LinkText
                url={`/documents/contracts?search=${eventData.contractNumber}`}
                content={eventData.contractNumber}
              />
            ),
          }}
        />
      );
    case TrackedEventName.REJECT_CONTRACT:
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
            inlineContractLink: (
              <LinkText
                url={`/documents/contracts?search=${eventData.contractNumber}`}
                content={eventData.contractNumber}
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
