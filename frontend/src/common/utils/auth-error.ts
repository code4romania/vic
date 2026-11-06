import { AxiosError } from 'axios';
import { AUTH_ERRORS } from '../errors/entities/auth.errors';
import { IBusinessException } from '../interfaces/business-exception.interface';

// The AUTH_xxx code of a failed auth call, or undefined for anything else (network, 500, ...).
// The per-IP throttler answers 429 with no code: it reads as AUTH_010 (too many requests).
export const getAuthErrorCode = (error: unknown): AUTH_ERRORS | undefined => {
  const response = (error as AxiosError<IBusinessException<AUTH_ERRORS>>)?.response;
  const code = response?.data?.code_error;
  if (code && Object.values(AUTH_ERRORS).includes(code)) return code;
  return response?.status === 429 ? AUTH_ERRORS.AUTH_010 : undefined;
};
