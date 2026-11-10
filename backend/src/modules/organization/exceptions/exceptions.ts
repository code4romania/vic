import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum OrganizationExceptionCodes {
  ORG_001 = 'ORG_001',
  ORG_002 = 'ORG_002',
  ORG_003 = 'ORG_003',
  ORG_004 = 'ORG_004',
  ORG_005 = 'ORG_005',
  ORG_006 = 'ORG_006',
  ORG_008 = 'ORG_008',
  ORG_009 = 'ORG_009',
  ORG_010 = 'ORG_010',
  ORG_011 = 'ORG_011',
  ORG_012 = 'ORG_012',
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
  [OrganizationExceptionCodes.ORG_004]: {
    message: 'There is already an organization with the same data',
    code_error: OrganizationExceptionCodes.ORG_004,
  },
  [OrganizationExceptionCodes.ORG_005]: {
    message: 'Organization not validated',
    code_error: OrganizationExceptionCodes.ORG_005,
  },
  [OrganizationExceptionCodes.ORG_006]: {
    message: 'The anti-robot check failed, please try again',
    code_error: OrganizationExceptionCodes.ORG_006,
  },
  // Team page
  [OrganizationExceptionCodes.ORG_008]: {
    message: 'This admin is not in your organization',
    code_error: OrganizationExceptionCodes.ORG_008,
  },
  [OrganizationExceptionCodes.ORG_009]: {
    message: 'Invites are only for admins who have not logged in yet',
    code_error: OrganizationExceptionCodes.ORG_009,
  },
  [OrganizationExceptionCodes.ORG_010]: {
    message: 'You cannot change your own status',
    code_error: OrganizationExceptionCodes.ORG_010,
  },
  // #508
  [OrganizationExceptionCodes.ORG_011]: {
    message: 'Type the organization name exactly to delete it',
    code_error: OrganizationExceptionCodes.ORG_011,
  },
  // M9
  [OrganizationExceptionCodes.ORG_012]: {
    message:
      'The tax id (CUI) cannot be changed after the organization was validated; contact the VIC team',
    code_error: OrganizationExceptionCodes.ORG_012,
  },
};
