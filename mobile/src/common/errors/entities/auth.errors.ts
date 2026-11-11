import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

// The backend's AUTH_001 to AUTH_015 (backend/docs/auth.md, Error codes).
export enum AUTH_ERRORS {
  AUTH_001 = 'AUTH_001', // wrong email or password
  AUTH_002 = 'AUTH_002', // locked
  AUTH_003 = 'AUTH_003', // email not confirmed
  AUTH_004 = 'AUTH_004', // disabled
  AUTH_005 = 'AUTH_005', // link invalid or expired
  AUTH_006 = 'AUTH_006', // wrong code / too many codes
  AUTH_007 = 'AUTH_007',
  AUTH_008 = 'AUTH_008',
  AUTH_009 = 'AUTH_009',
  AUTH_010 = 'AUTH_010', // too many requests
  AUTH_011 = 'AUTH_011', // app version too old (426)
  AUTH_012 = 'AUTH_012',
  AUTH_013 = 'AUTH_013',
  AUTH_015 = 'AUTH_015', // wrong code
}

export class AuthErrors extends ErrorClass<AUTH_ERRORS> {
  private static instance: AuthErrors;

  private constructor() {
    super(
      Object.fromEntries(
        Object.values(AUTH_ERRORS).map((code) => [code, i18n.t(`auth:errors.${code}`)]),
      ) as Record<AUTH_ERRORS, string>,
    );
  }

  public static getInstance(): AuthErrors {
    if (!AuthErrors.instance) {
      AuthErrors.instance = new AuthErrors();
    }

    return AuthErrors.instance;
  }
}
