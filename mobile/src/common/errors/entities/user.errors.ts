import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum USER_ERRORS {
  USER_001 = 'USER_001',
  USER_004 = 'USER_004',
  USER_003 = 'USER_003',
  USER_006 = 'USER_006',
  USER_008 = 'USER_008',
}

export class UserErrors extends ErrorClass<USER_ERRORS> {
  private static instance: UserErrors;

  private constructor() {
    super({
      [USER_ERRORS.USER_001]: i18n.t('user:errors.USER_001'),
      [USER_ERRORS.USER_004]: i18n.t('user:errors.USER_004'),
      [USER_ERRORS.USER_003]: i18n.t('user:errors.USER_003'),
      [USER_ERRORS.USER_006]: i18n.t('user:errors.USER_006'),
      [USER_ERRORS.USER_008]: i18n.t('user:errors.USER_008'),
    });
  }

  public static getInstance(): UserErrors {
    if (!UserErrors.instance) {
      UserErrors.instance = new UserErrors();
    }

    return UserErrors.instance;
  }
}
