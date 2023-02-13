import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum VOLUNTEERS_ERRORS {
  VOL_001 = 'VOL_001,',
}

export class VolunteersErrors extends ErrorClass<VOLUNTEERS_ERRORS> {
  private static instance: VolunteersErrors;

  private constructor() {
    super({
      [VOLUNTEERS_ERRORS.VOL_001]: i18n.t('volunteer:errors.VOL_001'),
    });
  }

  public static getInstance(): VolunteersErrors {
    if (!VolunteersErrors.instance) {
      VolunteersErrors.instance = new VolunteersErrors();
    }

    return VolunteersErrors.instance;
  }
}
