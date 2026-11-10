import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum ACTIVITY_LOG_ERRORS {
  ACTIVITY_LOG_001 = 'ACTIVITY_LOG_001',
  ACTIVITY_LOG_002 = 'ACTIVITY_LOG_002',
  ACTIVITY_LOG_003 = 'ACTIVITY_LOG_003',
  ACTIVITY_LOG_005 = 'ACTIVITY_LOG_005',
  ACTIVITY_LOG_006 = 'ACTIVITY_LOG_006',
  ACTIVITY_LOG_007 = 'ACTIVITY_LOG_007',
  ACTIVITY_LOG_008 = 'ACTIVITY_LOG_008',
  ACTIVITY_LOG_009 = 'ACTIVITY_LOG_009',
  ACTIVITY_LOG_010 = 'ACTIVITY_LOG_010',
}

export class ActivityLogError extends ErrorClass<ACTIVITY_LOG_ERRORS> {
  private static instance: ActivityLogError;

  private constructor() {
    super({
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_001]: i18n.t('activity_log:errors.ACTIVITY_LOG_001'),
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_002]: i18n.t('activity_log:errors.ACTIVITY_LOG_002'),
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_003]: i18n.t('activity_log:errors.ACTIVITY_LOG_003'),
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_005]: i18n.t('activity_log:errors.ACTIVITY_LOG_005'),
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_006]: i18n.t('activity_log:errors.ACTIVITY_LOG_006'),
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_007]: i18n.t('activity_log:errors.ACTIVITY_LOG_007'),
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_008]: i18n.t('activity_log:errors.ACTIVITY_LOG_008'),
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_009]: i18n.t('activity_log:errors.ACTIVITY_LOG_009'),
      [ACTIVITY_LOG_ERRORS.ACTIVITY_LOG_010]: i18n.t('activity_log:errors.ACTIVITY_LOG_010'),
    });
  }

  public static getInstance(): ActivityLogError {
    if (!ActivityLogError.instance) {
      ActivityLogError.instance = new ActivityLogError();
    }

    return ActivityLogError.instance;
  }
}
