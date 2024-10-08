import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum EventsRSVPExceptionCodes {
  EVENT_RSVP_001 = 'EVENT_RSVP_001',
  EVENT_RSVP_002 = 'EVENT_RSVP_002',
  EVENT_RSVP_003 = 'EVENT_RSVP_003',
  EVENT_RSVP_004 = 'EVENT_RSVP_004',
  EVENT_RSVP_005 = 'EVENT_RSVP_005',
  EVENT_RSVP_006 = 'EVENT_RSVP_006',
  EVENT_RSVP_007 = 'EVENT_RSVP_007',
}

type EventRSVPExceptionCodeType = keyof typeof EventsRSVPExceptionCodes;

// Add messages for the coresponding Internal Exception Code
export const EventRSVPExceptionMessages: Record<
  EventsRSVPExceptionCodes,
  BusinessException<EventRSVPExceptionCodeType>
> = {
  [EventsRSVPExceptionCodes.EVENT_RSVP_001]: {
    code_error: EventsRSVPExceptionCodes.EVENT_RSVP_001,
    message: 'Event RSVP not found',
  },
  [EventsRSVPExceptionCodes.EVENT_RSVP_002]: {
    code_error: EventsRSVPExceptionCodes.EVENT_RSVP_002,
    message:
      'You need to be a volunteer in the organization to join a private event.',
  },
  [EventsRSVPExceptionCodes.EVENT_RSVP_003]: {
    code_error: EventsRSVPExceptionCodes.EVENT_RSVP_003,
    message: 'Only ACTIVE or ARCHIVED volunteers can join events.',
  },
  [EventsRSVPExceptionCodes.EVENT_RSVP_004]: {
    code_error: EventsRSVPExceptionCodes.EVENT_RSVP_004,
    message: 'The mention is mandatory for this event.',
  },
  [EventsRSVPExceptionCodes.EVENT_RSVP_005]: {
    code_error: EventsRSVPExceptionCodes.EVENT_RSVP_005,
    message:
      'You must complete your Volunteer Profile in order to respond to an event as volunteer.',
  },
  [EventsRSVPExceptionCodes.EVENT_RSVP_006]: {
    code_error: EventsRSVPExceptionCodes.EVENT_RSVP_006,
    message: 'This event cannot be attended because is not PUBLISHED.',
  },
  [EventsRSVPExceptionCodes.EVENT_RSVP_007]: {
    code_error: EventsRSVPExceptionCodes.EVENT_RSVP_007,
    message: 'You cannot respond to passed events',
  },
};
