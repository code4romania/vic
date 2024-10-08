import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum UserExceptionCodes {
  USER_001 = 'USER_001',
  USER_002 = 'USER_002',
  USER_003 = 'USER_003',
  USER_004 = 'USER_004',
  USER_005 = 'USER_005',
  USER_006 = 'USER_006',
  USER_007 = 'USER_007',
  USER_008 = 'USER_008',
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
  [UserExceptionCodes.USER_004]: {
    code_error: UserExceptionCodes.USER_004,
    message: 'There is already an user with the same ID number',
  },
  [UserExceptionCodes.USER_005]: {
    code_error: UserExceptionCodes.USER_005,
    message: 'Missing user identity data',
  },
  [UserExceptionCodes.USER_006]: {
    code_error: UserExceptionCodes.USER_006,
    message: 'Error while uploading profile picture in s3',
  },
  [UserExceptionCodes.USER_007]: {
    code_error: UserExceptionCodes.USER_007,
    message: 'Error while trying to delete user account',
  },
  [UserExceptionCodes.USER_008]: {
    code_error: UserExceptionCodes.USER_008,
    message: 'Error while trying to update the user data',
  },
};
