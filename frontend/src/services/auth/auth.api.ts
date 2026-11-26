import {
  IAdminProfile,
  INgoHubRegisterForm,
  ITokenInfo,
  IWebSession,
  LinkResult,
  NgoHubCallbackResult,
} from '../../common/interfaces/auth.interface';
import { Language } from '../../common/config/language';
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

// The account's language. explicit: the admin picked it, so it replaces what the account has; without
// it the API only fills an account that has no language yet. Answers with the language now saved.
export const setLanguage = async (
  language: Language,
  explicit: boolean,
): Promise<{ language: Language }> =>
  API.patch('/auth/web/language', { language, explicit }).then((res) => res.data);

export const resendVerification = async (email: string): Promise<void> => {
  await API.post('/auth/web/resend-verification', { email });
};

export const getTokenInfo = async (secret: string): Promise<ITokenInfo> =>
  API.get(`/auth/token/${encodeURIComponent(secret)}`).then((res) => res.data);

// Always 200: a used, expired or unknown link gets a fresh one only when that is allowed (R14).
export const resendToken = async (secret: string): Promise<void> => {
  await API.post(`/auth/token/${encodeURIComponent(secret)}/resend`);
};

// Login with NGO Hub. The browser goes to /start itself (a top-level navigation): the API sets the flow
// cookie there and redirects to NGO Hub. promptLogin asks NGO Hub for a fresh login (after a VIC logout).
export const ngohubStartUrl = (promptLogin = false): string =>
  `${import.meta.env.VITE_API_URL}/auth/web/ngohub/start${promptLogin ? '?prompt=login' : ''}`;

export const ngohubCallback = async (params: {
  code: string;
  state: string;
  iss?: string;
}): Promise<NgoHubCallbackResult> =>
  API.post('/auth/web/ngohub/callback', params).then((res) => res.data);

// The prefilled form with the ticket from the callback; an uploaded logo wins over NGO Hub's.
export const registerNgoHubOrganization = async (
  ticket: string,
  form: INgoHubRegisterForm,
  logo?: File,
): Promise<IWebSession> => {
  const data = new FormData();
  data.append('ticket', ticket);
  Object.entries(form).forEach(([key, value]) => {
    // Empty optional fields are left out, like on the normal registration.
    if (value !== '') data.append(key, String(value));
  });
  if (logo) data.append('logo', logo);
  return API.post('/auth/web/ngohub/register', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

// "It was not us" from the email to the other admins.
export const ngohubNotUs = async (token: string): Promise<void> => {
  await API.post('/auth/web/ngohub/not-us', { token });
};

export const confirmEmail = async (token: string): Promise<LinkResult> =>
  API.post('/auth/confirm-email', { token }).then((res) => res.data);
