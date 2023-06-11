import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum ACCESS_CODE_ERRORS {
  ACCESS_CODE_001 = 'ACCESS_CODE_001',
  USER_001 = 'USER_001',
  ORG_001 = 'ORG_001',
  VOLUNTEER_002 = 'VOLUNTEER_002',
  USER_005 = 'USER_005',
}

export class AccessCodeErrors extends ErrorClass<ACCESS_CODE_ERRORS> {
  private static instance: AccessCodeErrors;

  private constructor() {
    super({
      [ACCESS_CODE_ERRORS.ACCESS_CODE_001]: i18n.t('join_ngo:errors.ACCESS_CODE_001'),
      [ACCESS_CODE_ERRORS.ORG_001]: i18n.t('join_ngo:errors.ORG_001'),
      [ACCESS_CODE_ERRORS.USER_005]: i18n.t('join_ngo:errors.USER_005'),
      [ACCESS_CODE_ERRORS.USER_001]: i18n.t('join_ngo:errors.USER_005'),
      [ACCESS_CODE_ERRORS.VOLUNTEER_002]: i18n.t('join_ngo:errors.VOLUNTEER_002'),
    });
  }

  public static getInstance(): AccessCodeErrors {
    if (!AccessCodeErrors.instance) {
      AccessCodeErrors.instance = new AccessCodeErrors();
    }

    return AccessCodeErrors.instance;
  }
}
