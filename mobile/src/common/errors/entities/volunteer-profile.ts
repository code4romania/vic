import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum VOLUNTEER_PROFILE_ERRORS {
  VOLUNTEER_001 = 'VOLUNTEER_001',
  VOLUNTEER_PROFILE_001 = 'VOLUNTEER_PROFILE_001',
  ORGANIZATION_STRUCTURE_001 = 'ORGANIZATION_STRUCTURE_001',
}

export class VolunterProfileErrors extends ErrorClass<VOLUNTEER_PROFILE_ERRORS> {
  private static instance: VolunterProfileErrors;

  private constructor() {
    super({
      [VOLUNTEER_PROFILE_ERRORS.VOLUNTEER_001]: i18n.t(
        'create_volunteer:form.submit.errors.VOLUNTEER_001',
      ),
      [VOLUNTEER_PROFILE_ERRORS.VOLUNTEER_PROFILE_001]: i18n.t(
        'create_volunteer:form.submit.errors.VOLUNTEER_PROFILE_001',
      ),
      [VOLUNTEER_PROFILE_ERRORS.ORGANIZATION_STRUCTURE_001]: i18n.t(
        'create_volunteer:form.submit.errors.ORGANIZATION_STRUCTURE_001',
      ),
    });
  }

  public static getInstance(): VolunterProfileErrors {
    if (!VolunterProfileErrors.instance) {
      VolunterProfileErrors.instance = new VolunterProfileErrors();
    }

    return VolunterProfileErrors.instance;
  }
}
