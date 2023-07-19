import i18n from '../../config/i18n';
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
}

export class EventErrors extends ErrorClass<EVENT_ERRORS> {
  private static instance: EventErrors;

  private constructor() {
    super({
      [EVENT_ERRORS.EVENT_001]: i18n.t('activity_log:errors.EVENT_001'),
      [EVENT_ERRORS.EVENT_RSVP_001]: i18n.t('event:errors.EVENT_RSVP_001'),
      [EVENT_ERRORS.EVENT_RSVP_002]: i18n.t('event:errors.EVENT_RSVP_002'),
      [EVENT_ERRORS.EVENT_RSVP_003]: i18n.t('event:errors.EVENT_RSVP_003'),
      [EVENT_ERRORS.EVENT_RSVP_004]: i18n.t('event:errors.EVENT_RSVP_004'),
      [EVENT_ERRORS.EVENT_RSVP_005]: i18n.t('event:errors.EVENT_RSVP_005'),
      [EVENT_ERRORS.EVENT_RSVP_006]: i18n.t('event:errors.EVENT_RSVP_006'),
      [EVENT_ERRORS.EVENT_RSVP_007]: i18n.t('event:errors.EVENT_RSVP_007'),
    });
  }

  public static getInstance(): EventErrors {
    if (!EventErrors.instance) {
      EventErrors.instance = new EventErrors();
    }

    return EventErrors.instance;
  }
}
