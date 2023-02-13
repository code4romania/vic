import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum ORGANIZATION_ERRORS {
  ORG_001 = 'ORG_001',
  ACCESS_CODE_001 = 'ACCESS_CODE_001',
  ACCESS_CODE_002 = 'ACCESS_CODE_002',
}

export class OrganizationError extends ErrorClass<ORGANIZATION_ERRORS> {
  private static instance: OrganizationError;

  private constructor() {
    super({
      [ORGANIZATION_ERRORS.ORG_001]: i18n.t('organization:errors.ORG_001'),
      [ORGANIZATION_ERRORS.ACCESS_CODE_001]: i18n.t(''),
      [ORGANIZATION_ERRORS.ACCESS_CODE_002]: i18n.t(''),
    });
  }

  public static getInstance(): OrganizationError {
    if (!OrganizationError.instance) {
      OrganizationError.instance = new OrganizationError();
    }

    return OrganizationError.instance;
  }
}
