import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum UserExceptionCodes {
  USER_001 = 'USER_001',
  USER_002 = 'USER_002',
  USER_003 = 'USER_003',
}

type UserExceptionCodeType = keyof typeof UserExceptionCodes;

// Add messages for the coresponding Internal Exception Code
export const UserExceptionMessages: Record<
  UserExceptionCodes,
  BusinessException<UserExceptionCodeType>
> = {
  [UserExceptionCodes.USER_001]: {
    code_error: UserExceptionCodes.USER_001,
    message: 'User not found',
  },
  [UserExceptionCodes.USER_002]: {
    code_error: UserExceptionCodes.USER_002,
    message: 'Error while creating admin user',
  },
  [UserExceptionCodes.USER_003]: {
    code_error: UserExceptionCodes.USER_003,
    message: 'There is already an user with the same data',
  },
};
