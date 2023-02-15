import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum AccessRequestsExceptionCodes {
  ACCESS_REQUEST_001 = 'ACCESS_REQUEST_001',
}

type AccessRequestExceptionCodeType = keyof typeof AccessRequestsExceptionCodes;

// Add messages for the coresponding Internal Exception Code
export const OrganizationStructureExceptionMessages: Record<
  AccessRequestsExceptionCodes,
  BusinessException<AccessRequestExceptionCodeType>
> = {
  [AccessRequestsExceptionCodes.ACCESS_REQUEST_001]: {
    code_error: AccessRequestsExceptionCodes.ACCESS_REQUEST_001,
    message:
      'There is already a PENDING request for the same user and organization.',
  },
};
