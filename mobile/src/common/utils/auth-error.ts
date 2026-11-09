import { AxiosError } from 'axios';
import { AUTH_ERRORS } from '../errors/entities/auth.errors';

// The AUTH_xxx code of a failed auth call, or undefined for anything else (offline, 500, ...).
// The per-IP throttler answers 429 with no code: it reads as AUTH_010 (too many requests).
export const getAuthErrorCode = (error: unknown): AUTH_ERRORS | undefined => {
  const response = (error as AxiosError<{ code_error?: string }>)?.response;
  const code = response?.data?.code_error as AUTH_ERRORS | undefined;
  if (code && Object.values(AUTH_ERRORS).includes(code)) {
    return code;
  }
  return response?.status === 429 ? AUTH_ERRORS.AUTH_010 : undefined;
};
