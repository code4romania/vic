import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum VOLUNTEER_ERRORS {
  VOL_001 = 'VOL_001,',
}

export class VolunteerError extends ErrorClass<VOLUNTEER_ERRORS> {
  private static instance: VolunteerError;

  private constructor() {
    super({
      [VOLUNTEER_ERRORS.VOL_001]: i18n.t('volunteer:errors.VOL_001'),
    });
  }

  public static getInstance(): VolunteerError {
    if (!VolunteerError.instance) {
      VolunteerError.instance = new VolunteerError();
    }

    return VolunteerError.instance;
  }
}
