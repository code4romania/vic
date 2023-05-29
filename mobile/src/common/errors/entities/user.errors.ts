import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum USER_ERRORS {
  USER_001 = 'USER_001',
}

export class UserErrors extends ErrorClass<USER_ERRORS> {
  private static instance: UserErrors;

  private constructor() {
    super({
      [USER_ERRORS.USER_001]: i18n.t('user:errors.USER_001'),
    });
  }

  public static getInstance(): UserErrors {
    if (!UserErrors.instance) {
      UserErrors.instance = new UserErrors();
    }

    return UserErrors.instance;
  }
}