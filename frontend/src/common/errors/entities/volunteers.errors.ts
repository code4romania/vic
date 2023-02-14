import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum VOLUNTEERS_ERRORS {
  VOLS_001 = 'VOLS_001,',
}

export class VolunteersErrors extends ErrorClass<VOLUNTEERS_ERRORS> {
  private static instance: VolunteersErrors;

  private constructor() {
    super({
      [VOLUNTEERS_ERRORS.VOLS_001]: i18n.t('volunteers:errors.VOLS_001'),
    });
  }

  public static getInstance(): VolunteersErrors {
    if (!VolunteersErrors.instance) {
      VolunteersErrors.instance = new VolunteersErrors();
    }

    return VolunteersErrors.instance;
  }
}
