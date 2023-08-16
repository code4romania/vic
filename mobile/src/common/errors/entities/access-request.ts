import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum ACCESS_REQUEST_ERRORS {
  ACCESS_REQUEST_001 = 'ACCESS_REQUEST_001',
  ACCESS_REQUEST_002 = 'ACCESS_REQUEST_002',
  ORG_001 = 'ORG_001',
  VOLUNTEER_002 = 'VOLUNTEER_002',
  USER_005 = 'USER_005',
}

export class AccessRequestErrors extends ErrorClass<ACCESS_REQUEST_ERRORS> {
  private static instance: AccessRequestErrors;

  private constructor() {
    super({
      [ACCESS_REQUEST_ERRORS.ACCESS_REQUEST_001]: i18n.t('join_ngo:errors.ACCESS_REQUEST_001'),
      [ACCESS_REQUEST_ERRORS.ACCESS_REQUEST_002]: i18n.t(
        'access_request:errors.ACCESS_REQUEST_002',
      ),
      [ACCESS_REQUEST_ERRORS.ORG_001]: i18n.t('join_ngo:errors.ORG_001'),
      [ACCESS_REQUEST_ERRORS.USER_005]: i18n.t('join_ngo:errors.USER_005'),
      [ACCESS_REQUEST_ERRORS.VOLUNTEER_002]: i18n.t('join_ngo:errors.VOLUNTEER_002'),
    });
  }

  public static getInstance(): AccessRequestErrors {
    if (!AccessRequestErrors.instance) {
      AccessRequestErrors.instance = new AccessRequestErrors();
    }

    return AccessRequestErrors.instance;
  }
}
