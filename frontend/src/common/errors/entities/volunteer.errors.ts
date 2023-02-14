import { ErrorClass } from '../base-error.class';

export enum VOLUNTEER_ERRORS {}

export class VolunteerError extends ErrorClass<VOLUNTEER_ERRORS> {
  private static instance: VolunteerError;

  private constructor() {
    super({});
  }

  public static getInstance(): VolunteerError {
    if (!VolunteerError.instance) {
      VolunteerError.instance = new VolunteerError();
    }

    return VolunteerError.instance;
  }
}
