import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum OrganizationStructureExceptionCodes {
  ORGANIZATION_STRUCTURE_001 = 'ORGANIZATION_STRUCTURE_001',
  ORGANIZATION_STRUCTURE_002 = 'ORGANIZATION_STRUCTURE_002',
}

type OrganizationStructureExceptionCodeType =
  keyof typeof OrganizationStructureExceptionCodes;

// Add messages for the coresponding Internal Exception Code
export const OrganizationStructureExceptionMessages: Record<
  OrganizationStructureExceptionCodes,
  BusinessException<OrganizationStructureExceptionCodeType>
> = {
  [OrganizationStructureExceptionCodes.ORGANIZATION_STRUCTURE_001]: {
    code_error: OrganizationStructureExceptionCodes.ORGANIZATION_STRUCTURE_001,
    message: 'Organization Structure not found.',
  },
  [OrganizationStructureExceptionCodes.ORGANIZATION_STRUCTURE_002]: {
    code_error: OrganizationStructureExceptionCodes.ORGANIZATION_STRUCTURE_002,
    message:
      'Organization Structure with the same "name" and "type" already exists in this organization.',
  },
};
