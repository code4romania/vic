import {
  IAdminProfile,
  ITokenInfo,
  IWebSession,
  LinkResult,
} from '../../common/interfaces/auth.interface';
import API from '../api';

// One function per web auth route of the backend (docs/auth.md, Endpoints).

// VIC 2.0 (#514): no passwords. Always 204 for an admin email (the page never says whether an account
// exists); a volunteer email answers 409 AUTH_012 (use the app).
export const requestLogin = async (email: string): Promise<void> => {
  await API.post('/auth/web/login/request', { email });
};

// The emailed link (login, Team invite or cutover transition) → a web session and the vic_refresh cookie.
export const loginWithLink = async (token: string): Promise<LinkResult> =>
  API.post('/auth/login-link', { token }).then((res) => res.data);

// Google or Apple ID token (#512) → a web session for an existing admin, same answer as a magic link.
export const loginWithSocial = async (
  provider: 'google' | 'apple',
  token: string,
): Promise<IWebSession> =>
  API.post('/auth/web/social', { provider, token }).then((res) => res.data);

export const refresh = async (): Promise<IWebSession> =>
  API.post('/auth/web/refresh').then((res) => res.data);

export const logout = async (): Promise<void> => {
  await API.post('/auth/web/logout');
};

export const getMe = async (): Promise<IAdminProfile> =>
  API.get('/auth/web/me').then((res) => res.data);

export const resendVerification = async (email: string): Promise<void> => {
  await API.post('/auth/web/resend-verification', { email });
};

export const getTokenInfo = async (secret: string): Promise<ITokenInfo> =>
  API.get(`/auth/token/${encodeURIComponent(secret)}`).then((res) => res.data);

// Always 200: a used, expired or unknown link gets a fresh one only when that is allowed (R14).
export const resendToken = async (secret: string): Promise<void> => {
  await API.post(`/auth/token/${encodeURIComponent(secret)}/resend`);
};

export const confirmEmail = async (token: string): Promise<LinkResult> =>
  API.post('/auth/confirm-email', { token }).then((res) => res.data);
