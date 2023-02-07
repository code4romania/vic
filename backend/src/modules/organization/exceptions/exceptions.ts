import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum OrganizationExceptionCodes {
  ORG_001 = 'ORG_001',
  ORG_002 = 'ORG_002',
  ORG_003 = 'ORG_003',
}

type OrganizationExceptionCodeType = keyof typeof OrganizationExceptionCodes;

// Add messages for the coresponding Internal Exception Code
export const OrganizationExceptionMessages: Record<
  OrganizationExceptionCodes,
  BusinessException<OrganizationExceptionCodeType>
> = {
  [OrganizationExceptionCodes.ORG_001]: {
    code_error: OrganizationExceptionCodes.ORG_001,
    message: 'Organization not found',
  },
  [OrganizationExceptionCodes.ORG_002]: {
    message: 'Organization already exists',
    code_error: OrganizationExceptionCodes.ORG_002,
  },
  [OrganizationExceptionCodes.ORG_003]: {
    message: 'Error while creating the organization',
    code_error: OrganizationExceptionCodes.ORG_003,
  },
};
