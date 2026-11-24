import { ErrorClass } from '../base-error.class';

export enum EVENT_ERRORS {
  EVENT_001 = 'EVENT_001',
  EVENT_RSVP_001 = 'EVENT_RSVP_001',
  EVENT_RSVP_002 = 'EVENT_RSVP_002',
  EVENT_RSVP_003 = 'EVENT_RSVP_003',
  EVENT_RSVP_004 = 'EVENT_RSVP_004',
  EVENT_RSVP_005 = 'EVENT_RSVP_005',
  EVENT_RSVP_006 = 'EVENT_RSVP_006',
  EVENT_RSVP_007 = 'EVENT_RSVP_007',
  EVENT_RSVP_008 = 'EVENT_RSVP_008',
}

export class EventErrors extends ErrorClass<EVENT_ERRORS> {
  private static instance: EventErrors;

  private constructor() {
    super({
      [EVENT_ERRORS.EVENT_001]: 'activity_log:errors.EVENT_001',
      [EVENT_ERRORS.EVENT_RSVP_001]: 'event:errors.EVENT_RSVP_001',
      [EVENT_ERRORS.EVENT_RSVP_002]: 'event:errors.EVENT_RSVP_002',
      [EVENT_ERRORS.EVENT_RSVP_003]: 'event:errors.EVENT_RSVP_003',
      [EVENT_ERRORS.EVENT_RSVP_004]: 'event:errors.EVENT_RSVP_004',
      [EVENT_ERRORS.EVENT_RSVP_005]: 'event:errors.EVENT_RSVP_005',
      [EVENT_ERRORS.EVENT_RSVP_006]: 'event:errors.EVENT_RSVP_006',
      [EVENT_ERRORS.EVENT_RSVP_007]: 'event:errors.EVENT_RSVP_007',
      [EVENT_ERRORS.EVENT_RSVP_008]: 'event:errors.EVENT_RSVP_008',
    });
  }

  public static getInstance(): EventErrors {
    if (!EventErrors.instance) {
      EventErrors.instance = new EventErrors();
    }

    return EventErrors.instance;
  }
}
