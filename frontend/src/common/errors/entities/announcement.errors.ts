import { ErrorClass } from '../base-error.class';

export enum ANNOUNCEMENT_ERRORS {}

export class AnnouncementError extends ErrorClass<ANNOUNCEMENT_ERRORS> {
  private static instance: AnnouncementError;

  private constructor() {
    super({});
  }

  public static getInstance(): AnnouncementError {
    if (!AnnouncementError.instance) {
      AnnouncementError.instance = new AnnouncementError();
    }

    return AnnouncementError.instance;
  }
}
