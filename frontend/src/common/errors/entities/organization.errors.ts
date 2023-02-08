import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum ORGANIZATION_ERRORS {
  ORG_001 = 'ORG_001',
}

export class OrganizationError extends ErrorClass<ORGANIZATION_ERRORS> {
  private static instance: OrganizationError;

  private constructor() {
    super({
      [ORGANIZATION_ERRORS.ORG_001]: i18n.t('organization:errors.ORG_001'),
    });
  }

  public static getInstance(): OrganizationError {
    if (!OrganizationError.instance) {
      OrganizationError.instance = new OrganizationError();
    }

    return OrganizationError.instance;
  }
}
