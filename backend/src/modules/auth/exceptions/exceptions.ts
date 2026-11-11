import { HttpException, HttpStatus } from '@nestjs/common';
import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum AuthExceptionCodes {
  AUTH_001 = 'AUTH_001',
  AUTH_002 = 'AUTH_002',
  AUTH_003 = 'AUTH_003',
  AUTH_004 = 'AUTH_004',
  AUTH_005 = 'AUTH_005',
  AUTH_006 = 'AUTH_006',
  AUTH_007 = 'AUTH_007',
  AUTH_008 = 'AUTH_008',
  AUTH_009 = 'AUTH_009',
  AUTH_010 = 'AUTH_010',
  AUTH_011 = 'AUTH_011',
  AUTH_012 = 'AUTH_012',
  AUTH_013 = 'AUTH_013',
  AUTH_014 = 'AUTH_014',
  AUTH_015 = 'AUTH_015',
}

type AuthExceptionCodeType = keyof typeof AuthExceptionCodes;

// Add messages for the coresponding Internal Exception Code. The clients map code_error to their own text.
export const AuthExceptionMessages: Record<
  AuthExceptionCodes,
  BusinessException<AuthExceptionCodeType>
> = {
  [AuthExceptionCodes.AUTH_001]: {
    code_error: AuthExceptionCodes.AUTH_001,
    message: 'Invalid email or password',
  },
  [AuthExceptionCodes.AUTH_002]: {
    code_error: AuthExceptionCodes.AUTH_002,
    message: 'Account locked, try again later',
  },
  [AuthExceptionCodes.AUTH_003]: {
    code_error: AuthExceptionCodes.AUTH_003,
    message: 'Email not confirmed yet',
  },
  [AuthExceptionCodes.AUTH_004]: {
    code_error: AuthExceptionCodes.AUTH_004,
    message: 'Account disabled',
  },
  [AuthExceptionCodes.AUTH_005]: {
    code_error: AuthExceptionCodes.AUTH_005,
    message: 'Token or link invalid, expired or already used',
  },
  [AuthExceptionCodes.AUTH_006]: {
    code_error: AuthExceptionCodes.AUTH_006,
    message: 'Too many wrong codes, request a new one',
  },
  [AuthExceptionCodes.AUTH_007]: {
    code_error: AuthExceptionCodes.AUTH_007,
    message: 'Password does not meet the rules',
  },
  [AuthExceptionCodes.AUTH_008]: {
    code_error: AuthExceptionCodes.AUTH_008,
    message: 'Refresh token invalid or reused',
  },
  [AuthExceptionCodes.AUTH_009]: {
    code_error: AuthExceptionCodes.AUTH_009,
    message: 'Email already registered',
  },
  [AuthExceptionCodes.AUTH_010]: {
    code_error: AuthExceptionCodes.AUTH_010,
    message: 'Too many requests for this account',
  },
  [AuthExceptionCodes.AUTH_011]: {
    code_error: AuthExceptionCodes.AUTH_011,
    message: 'App version too old, please update',
  },
  [AuthExceptionCodes.AUTH_012]: {
    code_error: AuthExceptionCodes.AUTH_012,
    message: 'This is a volunteer account, use the mobile app',
  },
  [AuthExceptionCodes.AUTH_013]: {
    code_error: AuthExceptionCodes.AUTH_013,
    message: 'Social token invalid or email not verified',
  },
  [AuthExceptionCodes.AUTH_014]: {
    code_error: AuthExceptionCodes.AUTH_014,
    message: 'No admin account for this email',
  },
  [AuthExceptionCodes.AUTH_015]: {
    code_error: AuthExceptionCodes.AUTH_015,
    message: 'Wrong code',
  },
};

// HttpStatus in this Nest version has no LOCKED (423) or UPGRADE_REQUIRED (426), hence plain numbers.
export const AuthExceptionStatus: Record<AuthExceptionCodes, number> = {
  [AuthExceptionCodes.AUTH_001]: HttpStatus.UNAUTHORIZED,
  [AuthExceptionCodes.AUTH_002]: 423,
  [AuthExceptionCodes.AUTH_003]: HttpStatus.FORBIDDEN,
  [AuthExceptionCodes.AUTH_004]: HttpStatus.FORBIDDEN,
  [AuthExceptionCodes.AUTH_005]: HttpStatus.BAD_REQUEST,
  [AuthExceptionCodes.AUTH_006]: HttpStatus.BAD_REQUEST,
  [AuthExceptionCodes.AUTH_007]: HttpStatus.BAD_REQUEST,
  [AuthExceptionCodes.AUTH_008]: HttpStatus.UNAUTHORIZED,
  [AuthExceptionCodes.AUTH_009]: HttpStatus.CONFLICT,
  [AuthExceptionCodes.AUTH_010]: HttpStatus.TOO_MANY_REQUESTS,
  [AuthExceptionCodes.AUTH_011]: 426,
  [AuthExceptionCodes.AUTH_012]: HttpStatus.CONFLICT,
  [AuthExceptionCodes.AUTH_013]: HttpStatus.UNAUTHORIZED,
  [AuthExceptionCodes.AUTH_014]: HttpStatus.NOT_FOUND,
  [AuthExceptionCodes.AUTH_015]: HttpStatus.BAD_REQUEST,
};

// ExceptionsService only covers 400/401/403/404/500; auth needs 409, 423, 426 and 429 too.
// The response body is { message, code_error }, like every other business exception.
export class AuthException extends HttpException {
  constructor(public readonly code: AuthExceptionCodes) {
    super(AuthExceptionMessages[code], AuthExceptionStatus[code]);
  }
}
