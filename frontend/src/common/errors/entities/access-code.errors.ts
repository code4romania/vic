import { ErrorClass } from '../base-error.class';

export enum ACEESS_CODE_ERRORS {}

export class AccessCodeError extends ErrorClass<ACEESS_CODE_ERRORS> {
  private static instance: AccessCodeError;

  private constructor() {
    super({});
  }

  public static getInstance(): AccessCodeError {
    if (!AccessCodeError.instance) {
      AccessCodeError.instance = new AccessCodeError();
    }

    return AccessCodeError.instance;
  }
}
