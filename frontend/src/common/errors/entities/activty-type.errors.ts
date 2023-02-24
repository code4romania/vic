import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum ACTIVITY_TYPE_ERRORS {
  ACTIVITY_TYPE_001 = 'ACTIVITY_TYPE_001',
  ACTIVITY_TYPE_002 = 'ACTIVITY_TYPE_002',
  ACTIVITY_TYPE_003 = 'ACTIVITY_TYPE_003',
  ACTIVITY_TYPE_004 = 'ACTIVITY_TYPE_004',
}

export class ActivityTypeError extends ErrorClass<ACTIVITY_TYPE_ERRORS> {
  private static instance: ActivityTypeError;

  private constructor() {
    super({
      [ACTIVITY_TYPE_ERRORS.ACTIVITY_TYPE_001]: i18n.t('activity_types:errors.ACTIVITY_TYPE_001'),
      [ACTIVITY_TYPE_ERRORS.ACTIVITY_TYPE_002]: i18n.t('activity_types:errors.ACTIVITY_TYPE_002'),
      [ACTIVITY_TYPE_ERRORS.ACTIVITY_TYPE_003]: i18n.t('activity_types:errors.ACTIVITY_TYPE_003'),
      [ACTIVITY_TYPE_ERRORS.ACTIVITY_TYPE_004]: i18n.t('activity_types:errors.ACTIVITY_TYPE_004'),
    });
  }

  public static getInstance(): ActivityTypeError {
    if (!ActivityTypeError.instance) {
      ActivityTypeError.instance = new ActivityTypeError();
    }

    return ActivityTypeError.instance;
  }
}
