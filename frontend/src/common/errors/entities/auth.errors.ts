import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

// The backend's AUTH_001 to AUTH_014 (backend/docs/auth.md, Error codes).
export enum AUTH_ERRORS {
  AUTH_001 = 'AUTH_001',
  AUTH_002 = 'AUTH_002',
  AUTH_003 = 'AUTH_003',
  AUTH_004 = 'AUTH_004',
  AUTH_005 = 'AUTH_005',
  AUTH_006 = 'AUTH_006',
  AUTH_007 = 'AUTH_007',
  AUTH_008 = 'AUTH_008',
  AUTH_009 = 'AUTH_009',
  AUTH_010 = 'AUTH_010',
  AUTH_011 = 'AUTH_011',
  AUTH_012 = 'AUTH_012',
  AUTH_013 = 'AUTH_013',
  AUTH_014 = 'AUTH_014',
}

export class AuthError extends ErrorClass<AUTH_ERRORS> {
  private static instance: AuthError;

  private constructor() {
    super(
      Object.fromEntries(
        Object.values(AUTH_ERRORS).map((code) => [code, i18n.t(`auth:errors.${code}`)]),
      ) as Record<AUTH_ERRORS, string>,
    );
  }

  public static getInstance(): AuthError {
    if (!AuthError.instance) {
      AuthError.instance = new AuthError();
    }

    return AuthError.instance;
  }
}
