import { BusinessException } from 'src/common/interfaces/business-exception.interface';

enum AccessCodeExceptionCodes {
  ACCESS_CODE_001 = 'ACCESS_CODE_001',
  ACCESS_CODE_002 = 'ACCESS_CODE_002',
}

type AccessCodeExceptionCodeType = keyof typeof AccessCodeExceptionCodes;

// Add messages for the coresponding Internal Exception Code
export const AccessCodeExceptionMessages: Record<
  AccessCodeExceptionCodes,
  BusinessException<AccessCodeExceptionCodeType>
> = {
  [AccessCodeExceptionCodes.ACCESS_CODE_001]: {
    code_error: AccessCodeExceptionCodes.ACCESS_CODE_001,
    message: 'Access Code not found.',
  },
  [AccessCodeExceptionCodes.ACCESS_CODE_002]: {
    code_error: AccessCodeExceptionCodes.ACCESS_CODE_002,
    message: 'Another "Access Code" with the same code already exists.',
  },
};
