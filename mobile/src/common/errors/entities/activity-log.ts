import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum ACTIVITY_LOG_ERRORS {
  ACTIVITY_LOG_001 = 'ACTIVITY_LOG_001',
  ACTIVITY_LOG_004 = 'ACTIVITY_LOG_004',
}

export class ActivityLogErrors extends ErrorClass<ACTIVITY_LOG_ERRORS> {
  private static instance: ActivityLogErrors;

  private constructor() {
    super({
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_001]: i18n.t('join_ngo:errors.ACCESS_REQUEST_001'),
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_004]: i18n.t('join_ngo:errors.ORG_001'),
    });
  }

  public static getInstance(): ActivityLogErrors {
    if (!ActivityLogErrors.instance) {
      ActivityLogErrors.instance = new ActivityLogErrors();
    }

    return ActivityLogErrors.instance;
  }
}
