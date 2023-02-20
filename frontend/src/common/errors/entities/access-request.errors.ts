import { ErrorClass } from '../base-error.class';

export enum ACCESS_REQUEST_ERRORS {}

export class AccessRequestError extends ErrorClass<ACCESS_REQUEST_ERRORS> {
  private static instance: AccessRequestError;

  private constructor() {
    super({});
  }

  public static getInstance(): AccessRequestError {
    if (!AccessRequestError.instance) {
      AccessRequestError.instance = new AccessRequestError();
    }

    return AccessRequestError.instance;
  }
}
