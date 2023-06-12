import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum ACTIVITY_LOG_ERRORS {
  ACTIVITY_LOG_001 = 'ACTIVITY_LOG_001',
  ACTIVITY_LOG_002 = 'ACTIVITY_LOG_002',
  ACTIVITY_LOG_004 = 'ACTIVITY_LOG_004',
  VOLUNTEER_001 = 'VOLUNTEER_001',
  EVENT_001 = 'EVENT_001',
  ACTIVITY_TYPE_001 = 'ACTIVITY_TYPE_001',
}

export class ActivityLogErrors extends ErrorClass<ACTIVITY_LOG_ERRORS> {
  private static instance: ActivityLogErrors;

  private constructor() {
    super({
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_001]: i18n.t('activity_log:errors.ACTIVITY_LOG_001'),
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_002]: i18n.t('activity_log:errors.ACTIVITY_LOG_002'),
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_004]: i18n.t('activity_log:errors.ACTIVITY_LOG_004'),
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_004]: i18n.t('activity_log:errors.ACTIVITY_LOG_004'),
      [ACTIVITY_LOG_ERRORS.VOLUNTEER_001]: i18n.t('activity_log:errors.VOLUNTEER_001'),
      [ACTIVITY_LOG_ERRORS.EVENT_001]: i18n.t('activity_log:errors.EVENT_001'),
      [ACTIVITY_LOG_ERRORS.ACTIVITY_TYPE_001]: i18n.t('activity_log:errors.ACTIVITY_TYPE_001'),
    });
  }

  public static getInstance(): ActivityLogErrors {
    if (!ActivityLogErrors.instance) {
      ActivityLogErrors.instance = new ActivityLogErrors();
    }

    return ActivityLogErrors.instance;
  }
}
