import { ErrorClass } from '../base-error.class';

export enum ANNOUNCEMENT_ERRORS {
  ANNOUNCEMENT_001 = 'ANNOUNCEMENT_001',
  ANNOUNCEMENT_002 = 'ANNOUNCEMENT_002',
  ANNOUNCEMENT_003 = 'ANNOUNCEMENT_003',
  ANNOUNCEMENT_005 = 'ANNOUNCEMENT_005',
}

export class AnnouncementError extends ErrorClass<ANNOUNCEMENT_ERRORS> {
  private static instance: AnnouncementError;

  private constructor() {
    super({
      [ANNOUNCEMENT_ERRORS.ANNOUNCEMENT_001]: 'announcement:error.ANNOUNCEMENT_001',
      [ANNOUNCEMENT_ERRORS.ANNOUNCEMENT_002]: 'announcement:error.ANNOUNCEMENT_002',
      [ANNOUNCEMENT_ERRORS.ANNOUNCEMENT_003]: 'announcement:error.ANNOUNCEMENT_003',
      [ANNOUNCEMENT_ERRORS.ANNOUNCEMENT_005]: 'announcement:error.ANNOUNCEMENT_005',
    });
  }

  public static getInstance(): AnnouncementError {
    if (!AnnouncementError.instance) {
      AnnouncementError.instance = new AnnouncementError();
    }

    return AnnouncementError.instance;
  }
}
