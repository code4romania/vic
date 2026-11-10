import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { AUTH_ERRORS } from '../../common/errors/entities/auth.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import {
  confirmEmail,
  getTokenInfo,
  loginWithLink,
  loginWithSocial,
  requestLogin,
  resendToken,
  resendVerification,
} from './auth.api';

export type AuthApiError = AxiosError<IBusinessException<AUTH_ERRORS>>;

// logout and the session itself go through useAuth() (AuthContextProvider).

export const useRequestLoginMutation = () =>
  useMutation((email: string) => requestLogin(email), {
    onError: (error: AuthApiError) => Promise.resolve(error),
  });

export const useResendVerificationMutation = () =>
  useMutation((email: string) => resendVerification(email), {
    onError: (error: AuthApiError) => Promise.resolve(error),
  });

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

export const useLoginWithLinkMutation = () =>
  useMutation((token: string) => loginWithLink(token), {
    onError: (error: AuthApiError) => Promise.resolve(error),
  });

export const useConfirmEmailMutation = () =>
  useMutation((token: string) => confirmEmail(token), {
    onError: (error: AuthApiError) => Promise.resolve(error),
  });

export const useLoginWithSocialMutation = () =>
  useMutation(
    ({ provider, token }: { provider: 'google' | 'apple'; token: string }) =>
      loginWithSocial(provider, token),
    {
      onError: (error: AuthApiError) => Promise.resolve(error),
    },
  );
