import { ErrorClass } from '../base-error.class';

export enum EVENT_ERRORS {
  EVENT_001 = 'EVENT_001',
  EVENT_002 = 'EVENT_002',
  EVENT_003 = 'EVENT_003',
  EVENT_004 = 'EVENT_004',
  EVENT_005 = 'EVENT_005',
  EVENT_006 = 'EVENT_006',
  EVENT_007 = 'EVENT_007',
  EVENT_008 = 'EVENT_008',
  EVENT_009 = 'EVENT_009',
  EVENT_010 = 'EVENT_010',
  EVENT_011 = 'EVENT_011',
  EVENT_RSVP_006 = 'EVENT_RSVP_006',
  EVENT_RSVP_007 = 'EVENT_RSVP_007',
  EVENT_RSVP_008 = 'EVENT_RSVP_008',
  EVENT_RSVP_009 = 'EVENT_RSVP_009',
  EVENT_RSVP_010 = 'EVENT_RSVP_010',
}

export class EventError extends ErrorClass<EVENT_ERRORS> {
  private static instance: EventError;

  private constructor() {
    super({
      [EVENT_ERRORS.EVENT_001]: 'events:errors.EVENT_001',
      [EVENT_ERRORS.EVENT_002]: 'events:errors.EVENT_002',
      [EVENT_ERRORS.EVENT_003]: 'events:errors.EVENT_003',
      [EVENT_ERRORS.EVENT_004]: 'events:errors.EVENT_004',
      [EVENT_ERRORS.EVENT_005]: 'events:errors.EVENT_005',
      [EVENT_ERRORS.EVENT_006]: 'events:errors.EVENT_006',
      [EVENT_ERRORS.EVENT_007]: 'events:errors.EVENT_007',
      [EVENT_ERRORS.EVENT_008]: 'events:errors.EVENT_008',
      [EVENT_ERRORS.EVENT_009]: 'events:errors.EVENT_009',
      [EVENT_ERRORS.EVENT_010]: 'events:errors.EVENT_010',
      [EVENT_ERRORS.EVENT_011]: 'events:errors.EVENT_011',
      [EVENT_ERRORS.EVENT_RSVP_006]: 'events:errors.EVENT_RSVP_006',
      [EVENT_ERRORS.EVENT_RSVP_007]: 'events:errors.EVENT_RSVP_007',
      [EVENT_ERRORS.EVENT_RSVP_008]: 'events:errors.EVENT_RSVP_008',
      [EVENT_ERRORS.EVENT_RSVP_009]: 'events:errors.EVENT_RSVP_009',
      [EVENT_ERRORS.EVENT_RSVP_010]: 'events:errors.EVENT_RSVP_010',
    });
  }

  public static getInstance(): EventError {
    if (!EventError.instance) {
      EventError.instance = new EventError();
    }

    return EventError.instance;
  }
}
