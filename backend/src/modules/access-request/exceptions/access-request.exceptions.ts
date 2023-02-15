import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum AccessRequestsExceptionCodes {
  ACCESS_REQUEST_001 = 'ACCESS_REQUEST_001',
  ACCESS_REQUEST_002 = 'ACCESS_REQUEST_002',
  ACCESS_REQUEST_003 = 'ACCESS_REQUEST_003',
}

type AccessRequestExceptionCodeType = keyof typeof AccessRequestsExceptionCodes;

// Add messages for the coresponding Internal Exception Code
export const AccessRequestExceptionMessages: Record<
  AccessRequestsExceptionCodes,
  BusinessException<AccessRequestExceptionCodeType>
> = {
  [AccessRequestsExceptionCodes.ACCESS_REQUEST_001]: {
    code_error: AccessRequestsExceptionCodes.ACCESS_REQUEST_001,
    message:
      'There is already a PENDING request for the same user and organization.',
  },
  [AccessRequestsExceptionCodes.ACCESS_REQUEST_002]: {
    code_error: AccessRequestsExceptionCodes.ACCESS_REQUEST_002,
    message: 'Access Request not found',
  },
  [AccessRequestsExceptionCodes.ACCESS_REQUEST_003]: {
    code_error: AccessRequestsExceptionCodes.ACCESS_REQUEST_003,
    message: 'Access Request must be in status REJECTED to allow deletion.',
  },
};
