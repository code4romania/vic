import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum EVENT_ERRORS {
  EVENT_001 = 'EVENT_001',
}

export class EventErrors extends ErrorClass<EVENT_ERRORS> {
  private static instance: EventErrors;

  private constructor() {
    super({
      [EVENT_ERRORS.EVENT_001]: i18n.t('event:errors.EVENT_001'),
    });
  }

  public static getInstance(): EventErrors {
    if (!EventErrors.instance) {
      EventErrors.instance = new EventErrors();
    }

    return EventErrors.instance;
  }
}
