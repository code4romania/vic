import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum ORGANIZATION_ERRORS {
  ORG_001 = 'ORG_001',
  ORG_004 = 'ORG_004',
  ORG_005 = 'ORG_005',
  ORG_006 = 'ORG_006',
  ORG_008 = 'ORG_008',
  ORG_009 = 'ORG_009',
  ORG_010 = 'ORG_010',
  ORG_011 = 'ORG_011',
  ACCESS_CODE_001 = 'ACCESS_CODE_001',
  ACCESS_CODE_002 = 'ACCESS_CODE_002',
}

export class OrganizationError extends ErrorClass<ORGANIZATION_ERRORS> {
  private static instance: OrganizationError;

  private constructor() {
    super({
      [ORGANIZATION_ERRORS.ORG_001]: i18n.t('organization:errors.ORG_001'),
      [ORGANIZATION_ERRORS.ORG_004]: i18n.t('organization:errors.ORG_004'),
      [ORGANIZATION_ERRORS.ORG_005]: i18n.t('organization:errors.ORG_005'),
      [ORGANIZATION_ERRORS.ORG_006]: i18n.t('organization:errors.ORG_006'),
      [ORGANIZATION_ERRORS.ORG_008]: i18n.t('organization:errors.ORG_008'),
      [ORGANIZATION_ERRORS.ORG_009]: i18n.t('organization:errors.ORG_009'),
      [ORGANIZATION_ERRORS.ORG_010]: i18n.t('organization:errors.ORG_010'),
      [ORGANIZATION_ERRORS.ORG_011]: i18n.t('organization:errors.ORG_011'),
      [ORGANIZATION_ERRORS.ACCESS_CODE_001]: i18n.t('access_code:errors.ACCESS_CODE_001'),
      [ORGANIZATION_ERRORS.ACCESS_CODE_002]: i18n.t('access_code:errors.ACCESS_CODE_002'),
    });
  }

  public static getInstance(): OrganizationError {
    if (!OrganizationError.instance) {
      OrganizationError.instance = new OrganizationError();
    }

    return OrganizationError.instance;
  }
}
