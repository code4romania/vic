import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum ANNOUNCEMENT_ERRORS {
  ANNOUNCEMENT_001 = 'ANNOUNCEMENT_001',
}

export class AnnouncementError extends ErrorClass<ANNOUNCEMENT_ERRORS> {
  private static instance: AnnouncementError;

  private constructor() {
    super({
      [ANNOUNCEMENT_ERRORS.ANNOUNCEMENT_001]: i18n.t('announcement:error.ANNOUNCEMENT_001'),
    });
  }

  public static getInstance(): AnnouncementError {
    if (!AnnouncementError.instance) {
      AnnouncementError.instance = new AnnouncementError();
    }

    return AnnouncementError.instance;
  }
}
