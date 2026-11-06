import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { AUTH_ERRORS } from '../../common/errors/entities/auth.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import {
  changePassword,
  confirmEmail,
  forgotPassword,
  getTokenInfo,
  resendToken,
  resendVerification,
  setPassword,
} from './auth.api';

export type AuthApiError = AxiosError<IBusinessException<AUTH_ERRORS>>;

// login, logout and the session itself go through useAuth() (AuthContextProvider).

export const useForgotPasswordMutation = () =>
  useMutation((email: string) => forgotPassword(email), {
    onError: (error: AuthApiError) => Promise.resolve(error),
  });

export const useResendVerificationMutation = () =>
  useMutation((email: string) => resendVerification(email), {
    onError: (error: AuthApiError) => Promise.resolve(error),
  });

export const useChangePasswordMutation = () =>
  useMutation(
    ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword(currentPassword, newPassword),
    { onError: (error: AuthApiError) => Promise.resolve(error) },
  );

export const useTokenInfoQuery = (secret: string | null) =>
  useQuery(['auth-token', secret], () => getTokenInfo(secret as string), {
    enabled: !!secret,
    retry: false,
    onError: (error: AuthApiError) => error,
  });

export const useResendTokenMutation = () =>
  useMutation((secret: string) => resendToken(secret), {
    onError: (error: AuthApiError) => Promise.resolve(error),
  });

export const useSetPasswordMutation = () =>
  useMutation(
    ({ token, password }: { token: string; password: string }) => setPassword(token, password),
    { onError: (error: AuthApiError) => Promise.resolve(error) },
  );

export const useConfirmEmailMutation = () =>
  useMutation((token: string) => confirmEmail(token), {
    onError: (error: AuthApiError) => Promise.resolve(error),
  });
