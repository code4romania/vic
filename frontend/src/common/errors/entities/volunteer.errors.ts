import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum VOLUNTEER_ERRORS {
  VOLUNTEER_001 = 'VOLUNTEER_001',
  VOLUNTEER_002 = 'VOLUNTEER_002',
  VOLUNTEER_003 = 'VOLUNTEER_003',
  VOLUNTEER_004 = 'VOLUNTEER_004',
  // Profile
  VOLUNTEER_PROFILE_001 = 'VOLUNTEER_PROFILE_001',
  VOLUNTEER_PROFILE_002 = 'VOLUNTEER_PROFILE_002',
  VOLUNTEER_PROFILE_003 = 'VOLUNTEER_PROFILE_003',
}

export class VolunteerError extends ErrorClass<VOLUNTEER_ERRORS> {
  private static instance: VolunteerError;

  private constructor() {
    super({
      [VOLUNTEER_ERRORS.VOLUNTEER_001]: i18n.t('volunteers:errors.VOLUNTEER_001'),
      [VOLUNTEER_ERRORS.VOLUNTEER_002]: i18n.t('volunteers:errors.VOLUNTEER_002'),
      [VOLUNTEER_ERRORS.VOLUNTEER_003]: i18n.t('volunteers:errors.VOLUNTEER_003'),
      [VOLUNTEER_ERRORS.VOLUNTEER_004]: i18n.t('volunteers:errors.VOLUNTEER_004'),
      [VOLUNTEER_ERRORS.VOLUNTEER_PROFILE_001]: i18n.t('volunteers:errors.VOLUNTEER_PROFILE_001'),
      [VOLUNTEER_ERRORS.VOLUNTEER_PROFILE_002]: i18n.t('volunteers:errors.VOLUNTEER_PROFILE_002'),
      [VOLUNTEER_ERRORS.VOLUNTEER_PROFILE_003]: i18n.t('volunteers:errors.VOLUNTEER_PROFILE_003'),
    });
  }

  public static getInstance(): VolunteerError {
    if (!VolunteerError.instance) {
      VolunteerError.instance = new VolunteerError();
    }

    return VolunteerError.instance;
  }
}
