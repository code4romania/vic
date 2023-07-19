import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum ORGANIZATION_ERRORS {
  VOLUNTEER_001 = 'VOLUNTEER_001',
  VOLUNTEER_003 = 'VOLUNTEER_003', // Only ACTIVE volunteers can be archived
  VOLUNTEER_004 = 'VOLUNTEER_004', // Only ARCHIVED volunteers can be activated.
  USER_001 = 'USER_001',
  ORG_001 = 'ORG_001',
  VOLUNTEER_005 = 'VOLUNTEER_005', // The user does not have a volunteer profile on this organization
}

export class OrganizationErrors extends ErrorClass<ORGANIZATION_ERRORS> {
  private static instance: OrganizationErrors;

  private constructor() {
    super({
      [ORGANIZATION_ERRORS.VOLUNTEER_001]: i18n.t(
        'create_volunteer:form.submit.errors.VOLUNTEER_001',
      ),
      [ORGANIZATION_ERRORS.VOLUNTEER_003]: i18n.t('volunteer:errors.VOLUNTEER_003'),
      [ORGANIZATION_ERRORS.VOLUNTEER_004]: i18n.t('volunteer:errors.VOLUNTEER_004'),
      [ORGANIZATION_ERRORS.USER_001]: i18n.t('user:errors.USER_001'),
      [ORGANIZATION_ERRORS.ORG_001]: i18n.t('join_ngo:errors.ORG_001'),
      [ORGANIZATION_ERRORS.VOLUNTEER_005]: i18n.t('volunteer:errors.VOLUNTEER_005'),
    });
  }

  public static getInstance(): OrganizationErrors {
    if (!OrganizationErrors.instance) {
      OrganizationErrors.instance = new OrganizationErrors();
    }

    return OrganizationErrors.instance;
  }
}
