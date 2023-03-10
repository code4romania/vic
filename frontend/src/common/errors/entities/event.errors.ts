import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum EVENT_ERRORS {
  EVENT_001 = 'EVENT_001',
  EVENT_002 = 'EVENT_002',
  EVENT_003 = 'EVENT_003',
  EVENT_004 = 'EVENT_004',
  EVENT_005 = 'EVENT_005',
  EVENT_006 = 'EVENT_006',
}

export class EventError extends ErrorClass<EVENT_ERRORS> {
  private static instance: EventError;

  private constructor() {
    super({
      [EVENT_ERRORS.EVENT_001]: i18n.t('event:errors.EVENT_001'),
      [EVENT_ERRORS.EVENT_002]: i18n.t('event:errors.EVENT_002'),
      [EVENT_ERRORS.EVENT_003]: i18n.t('event:errors.EVENT_003'),
      [EVENT_ERRORS.EVENT_004]: i18n.t('event:errors.EVENT_003'),
      [EVENT_ERRORS.EVENT_005]: i18n.t('event:errors.EVENT_003'),
      [EVENT_ERRORS.EVENT_006]: i18n.t('event:errors.EVENT_003'),
    });
  }

  public static getInstance(): EventError {
    if (!EventError.instance) {
      EventError.instance = new EventError();
    }

    return EventError.instance;
  }
}
