import API from '../api';
import { ITokens } from './token.storage';

export type SocialProvider = 'google' | 'facebook' | 'apple';

export interface ISession extends ITokens {
  expiresIn: number;
}

export interface IRequestLoginResult {
  maskedEmail: string;
}

// VIC 2.0 (#514): no passwords. Emails a 6-digit code (15 minutes). An unknown email gets a login
// too, so sign-up = login; the profile form (CreateUser) comes after. One code a minute (AUTH_010).
export const requestLogin = async (email: string): Promise<IRequestLoginResult> => {
  return API.post('/mobile/auth/login/request', { email }).then((res) => res.data);
};

// The code from requestLogin. AUTH_005 = wrong or expired code; the 5th wrong one ends it (AUTH_006).
export const loginWithCode = async (email: string, code: string): Promise<ISession> => {
  return API.post('/mobile/auth/login/code', { email, code }).then((res) => res.data);
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
