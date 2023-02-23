import { ErrorClass } from '../base-error.class';

export enum ACTIVITY_TYPE_ERRORS {}

export class ActivityTypeError extends ErrorClass<ACTIVITY_TYPE_ERRORS> {
  private static instance: ActivityTypeError;

  private constructor() {
    super({});
  }

  public static getInstance(): ActivityTypeError {
    if (!ActivityTypeError.instance) {
      ActivityTypeError.instance = new ActivityTypeError();
    }

    return ActivityTypeError.instance;
  }
}
