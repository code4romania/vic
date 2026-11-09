import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as Application from 'expo-application';
import useStore from '../store/store';
import { authEvents } from './auth/auth.events';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './auth/token.storage';

// Sent on every request: the backend answers 426 AUTH_011 below MOBILE_MIN_VERSION.
export const APP_VERSION = Application.nativeApplicationVersion ?? '0.0.0';

const API = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}`,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// The public auth routes: a 401 from them is an answer (wrong password, wrong code), never a reason
// to refresh. Every other 401, change-password included, refreshes once (decisions R23).
const NO_REFRESH_ROUTE =
  /^\/?mobile\/auth\/(register|resend-verification|login|social|refresh|logout|forgot-password|reset-password)$/;

export const isPublicAuthRoute = (url = ''): boolean => NO_REFRESH_ROUTE.test(url);

interface ISessionResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}

// Thrown when the backend refused the refresh token: the session is over.
class SessionEndedError extends Error {}

// One refresh at a time: every request that gets a 401 while it runs waits for the same promise, so
// a burst of requests never presents the same refresh token twice (that would end the session).
let refreshing: Promise<string> | null = null;

export const refreshAccessToken = (): Promise<string> => {
  if (!refreshing) {
    refreshing = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new SessionEndedError();
      }
      try {
        const { data } = await API.post<ISessionResponse>('/mobile/auth/refresh', { refreshToken });
        await setTokens(data);
        return data.accessToken;
      } catch (error) {
        const status = (error as AxiosError).response?.status;
        // 401 / 403: revoked, reused or expired. Anything else (offline, 5xx) keeps the session.
        if (status === 401 || status === 403) {
          throw new SessionEndedError();
        }
        throw error;
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
};

API.interceptors.request.use(async (request) => {
  request.headers.set('x-app-version', APP_VERSION);
  if (!request.headers.has('Authorization')) {
    const token = await getAccessToken();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return request;
});

API.interceptors.response.use(
  (response) => {
    // The API answers again: leave the Maintenance screen.
    if (useStore.getState().maintenance) {
      useStore.getState().setMaintenance(false);
    }
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as
      (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    // The cutover window: the load balancer, then the backend's MAINTENANCE_MODE (decisions R1, R2).
    if (status === 503) {
      useStore.getState().setMaintenance(true);
      throw error;
    }

    // AUTH_011: this build is below MOBILE_MIN_VERSION.
    if (status === 426) {
      useStore.getState().setUpdateRequired(true);
      throw error;
    }

    if (status === 401 && original && !original._retried && !isPublicAuthRoute(original.url)) {
      original._retried = true;
      try {
        const token = await refreshAccessToken();
        original.headers.set('Authorization', `Bearer ${token}`);
        return API(original);
      } catch (refreshError) {
        if (refreshError instanceof SessionEndedError) {
          await clearTokens();
          authEvents.emit('logout');
        }
      }
    }

    throw error;
  },
);

export default API;
