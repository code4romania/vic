export enum OrganizationExceptionCodes {
  ORG_001 = 'ORG_001',
  ORG_002 = 'ORG_002',
}

// Add messages for the coresponding Internal Exception Code
export const OrganizationExceptionMessages: Record<
  OrganizationExceptionCodes,
  string
> = {
  [OrganizationExceptionCodes.ORG_001]: 'Organization Not Found',
  [OrganizationExceptionCodes.ORG_002]: 'Organization already exists',
};
