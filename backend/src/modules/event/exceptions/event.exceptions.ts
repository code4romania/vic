import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum EventsExceptionCodes {
  EVENT_001 = 'EVENT_001',
  EVENT_002 = 'EVENT_002',
  EVENT_003 = 'EVENT_003',
  EVENT_004 = 'EVENT_004',
  EVENT_005 = 'EVENT_005',
  EVENT_006 = 'EVENT_006',
}

type EventExceptionCodeType = keyof typeof EventsExceptionCodes;

// Add messages for the coresponding Internal Exception Code
export const EventExceptionMessages: Record<
  EventsExceptionCodes,
  BusinessException<EventExceptionCodeType>
> = {
  [EventsExceptionCodes.EVENT_001]: {
    code_error: EventsExceptionCodes.EVENT_001,
    message: 'Event not found',
  },
  [EventsExceptionCodes.EVENT_002]: {
    code_error: EventsExceptionCodes.EVENT_002,
    message: 'Target departments are not correct.',
  },
  [EventsExceptionCodes.EVENT_003]: {
    code_error: EventsExceptionCodes.EVENT_003,
    message: 'Activity Tasks are not correct.',
  },
  [EventsExceptionCodes.EVENT_004]: {
    code_error: EventsExceptionCodes.EVENT_004,
    message: 'Cannot update target audience for published events.',
  },
  [EventsExceptionCodes.EVENT_005]: {
    code_error: EventsExceptionCodes.EVENT_005,
    message: 'Only ARCHIVED or DRAFT events can be PUBLISHED.',
  },
  [EventsExceptionCodes.EVENT_006]: {
    code_error: EventsExceptionCodes.EVENT_006,
    message: 'Only PUBLISHED events can be ARCHIVED.',
  },
};
