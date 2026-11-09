import API from '../api';
import { ITokens } from './token.storage';

export type SocialProvider = 'google' | 'facebook' | 'apple';

export interface ISession extends ITokens {
  expiresIn: number;
}

export interface IRegisterResult {
  maskedEmail: string;
  phone?: string;
}

// Sends the confirmation link; the account can log in once the link is opened.
export const register = async (
  email: string,
  password: string,
  phone?: string,
): Promise<IRegisterResult> => {
  return API.post('/mobile/auth/register', { email, password, phone }).then((res) => res.data);
};

// Always 200, whatever the email (decisions R14).
export const resendVerification = async (email: string): Promise<void> => {
  await API.post('/mobile/auth/resend-verification', { email });
};

export const login = async (email: string, password: string): Promise<ISession> => {
  return API.post('/mobile/auth/login', { email, password }).then((res) => res.data);
};

// Google and Apple: the identity token; Facebook: the access token.
export const loginWithSocial = async (
  provider: SocialProvider,
  token: string,
): Promise<ISession> => {
  return API.post('/mobile/auth/social', { provider, token }).then((res) => res.data);
};

export const logout = async (refreshToken: string): Promise<void> => {
  await API.post('/mobile/auth/logout', { refreshToken });
};

// Sends a 6-digit code; same answer for any email.
export const forgotPassword = async (email: string): Promise<void> => {
  await API.post('/mobile/auth/forgot-password', { email });
};

// The code from forgotPassword and the new password; answers with a session.
export const resetPassword = async (
  email: string,
  code: string,
  password: string,
): Promise<ISession> => {
  return API.post('/mobile/auth/reset-password', { email, code, password }).then((res) => res.data);
};

// Ends every other session of this login at its next refresh.
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  await API.patch('/mobile/auth/change-password', { currentPassword, newPassword });
};
