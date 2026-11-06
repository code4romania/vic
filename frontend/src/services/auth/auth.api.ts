import {
  IAdminProfile,
  ITokenInfo,
  IWebSession,
  LinkResult,
} from '../../common/interfaces/auth.interface';
import API from '../api';

// One function per web auth route of the backend (docs/auth.md, Endpoints).

export const login = async (email: string, password: string): Promise<IWebSession> =>
  API.post('/auth/web/login', { email, password }).then((res) => res.data);

export const refresh = async (): Promise<IWebSession> =>
  API.post('/auth/web/refresh').then((res) => res.data);

export const logout = async (): Promise<void> => {
  await API.post('/auth/web/logout');
};

export const getMe = async (): Promise<IAdminProfile> =>
  API.get('/auth/web/me').then((res) => res.data);

// Always 200: the page never says whether an account exists.
export const forgotPassword = async (email: string): Promise<void> => {
  await API.post('/auth/web/forgot-password', { email });
};

export const resendVerification = async (email: string): Promise<void> => {
  await API.post('/auth/web/resend-verification', { email });
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  await API.patch('/auth/web/change-password', { currentPassword, newPassword });
};

export const getTokenInfo = async (secret: string): Promise<ITokenInfo> =>
  API.get(`/auth/token/${encodeURIComponent(secret)}`).then((res) => res.data);

// Always 200: a used, expired or unknown link gets a fresh one only when that is allowed (R14).
export const resendToken = async (secret: string): Promise<void> => {
  await API.post(`/auth/token/${encodeURIComponent(secret)}/resend`);
};

export const setPassword = async (token: string, password: string): Promise<LinkResult> =>
  API.post('/auth/set-password', { token, password }).then((res) => res.data);

export const confirmEmail = async (token: string): Promise<LinkResult> =>
  API.post('/auth/confirm-email', { token }).then((res) => res.data);
