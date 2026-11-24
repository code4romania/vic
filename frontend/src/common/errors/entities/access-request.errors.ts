import { ErrorClass } from '../base-error.class';

export enum ACCESS_REQUEST_ERRORS {
  ACCESS_REQUEST_001 = 'ACCESS_REQUEST_001',
  ACCESS_REQUEST_002 = 'ACCESS_REQUEST_002',
  ACCESS_REQUEST_003 = 'ACCESS_REQUEST_003',
  ACCESS_REQUEST_004 = 'ACCESS_REQUEST_004',
  ACCESS_REQUEST_005 = 'ACCESS_REQUEST_005',
}

export class AccessRequestError extends ErrorClass<ACCESS_REQUEST_ERRORS> {
  private static instance: AccessRequestError;

  private constructor() {
    super({
      [ACCESS_REQUEST_ERRORS.ACCESS_REQUEST_001]: 'access_requests:errors.ACCESS_REQUEST_001',
      [ACCESS_REQUEST_ERRORS.ACCESS_REQUEST_002]: 'access_requests:errors.ACCESS_REQUEST_002',
      [ACCESS_REQUEST_ERRORS.ACCESS_REQUEST_003]: 'access_requests:errors.ACCESS_REQUEST_003',
      [ACCESS_REQUEST_ERRORS.ACCESS_REQUEST_004]: 'access_requests:errors.ACCESS_REQUEST_004',
      [ACCESS_REQUEST_ERRORS.ACCESS_REQUEST_005]: 'access_requests:errors.ACCESS_REQUEST_005',
    });
  }

  public static getInstance(): AccessRequestError {
    if (!AccessRequestError.instance) {
      AccessRequestError.instance = new AccessRequestError();
    }

    return AccessRequestError.instance;
  }
}
