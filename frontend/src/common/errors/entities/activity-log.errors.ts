import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum ACTIVITY_LOG_ERRORS {
  ACTIVITY_LOG_001 = 'ACTIVITY_LOG_001',
}

export class ActivityLogError extends ErrorClass<ACTIVITY_LOG_ERRORS> {
  private static instance: ActivityLogError;

  private constructor() {
    super({
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_001]: i18n.t('activity_log:errors.ACTIVITY_LOG_001'),
    });
  }

  public static getInstance(): ActivityLogError {
    if (!ActivityLogError.instance) {
      ActivityLogError.instance = new ActivityLogError();
    }

    return ActivityLogError.instance;
  }
}
