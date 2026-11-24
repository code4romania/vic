import { ErrorClass } from '../base-error.class';

export enum ORGANIZATION_ERRORS {
  ORG_001 = 'ORG_001',
  ORG_003 = 'ORG_003',
  ORG_004 = 'ORG_004',
  ORG_005 = 'ORG_005',
  ORG_008 = 'ORG_008',
  ORG_009 = 'ORG_009',
  ORG_010 = 'ORG_010',
  ORG_011 = 'ORG_011',
  ORG_012 = 'ORG_012',
  ORG_013 = 'ORG_013',
  ACCESS_CODE_001 = 'ACCESS_CODE_001',
  ACCESS_CODE_002 = 'ACCESS_CODE_002',
  ACCESS_CODE_003 = 'ACCESS_CODE_003',
}

export class OrganizationError extends ErrorClass<ORGANIZATION_ERRORS> {
  private static instance: OrganizationError;

  private constructor() {
    super({
      [ORGANIZATION_ERRORS.ORG_001]: 'organization:errors.ORG_001',
      [ORGANIZATION_ERRORS.ORG_003]: 'organization:errors.ORG_003',
      [ORGANIZATION_ERRORS.ORG_004]: 'organization:errors.ORG_004',
      [ORGANIZATION_ERRORS.ORG_005]: 'organization:errors.ORG_005',
      [ORGANIZATION_ERRORS.ORG_008]: 'organization:errors.ORG_008',
      [ORGANIZATION_ERRORS.ORG_009]: 'organization:errors.ORG_009',
      [ORGANIZATION_ERRORS.ORG_010]: 'organization:errors.ORG_010',
      [ORGANIZATION_ERRORS.ORG_011]: 'organization:errors.ORG_011',
      [ORGANIZATION_ERRORS.ORG_012]: 'organization:errors.ORG_012',
      [ORGANIZATION_ERRORS.ORG_013]: 'organization:errors.ORG_013',
      [ORGANIZATION_ERRORS.ACCESS_CODE_001]: 'access_code:errors.ACCESS_CODE_001',
      [ORGANIZATION_ERRORS.ACCESS_CODE_002]: 'access_code:errors.ACCESS_CODE_002',
      [ORGANIZATION_ERRORS.ACCESS_CODE_003]: 'access_code:errors.ACCESS_CODE_003',
    });
  }

  public static getInstance(): OrganizationError {
    if (!OrganizationError.instance) {
      OrganizationError.instance = new OrganizationError();
    }

    return OrganizationError.instance;
  }
}
