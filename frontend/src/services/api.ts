import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { IBusinessException } from '../common/interfaces/business-exception.interface';
import { tokenStore } from './auth/token.store';

// https://vitejs.dev/guide/env-and-mode.html
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  timeout: 100000,
  // Sends the httpOnly vic_refresh cookie to the API (another origin in development).
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// The public auth routes: a 401 from them is an answer (dead link), never a reason to refresh. Every
// other 401, /auth/web/me included, refreshes once (decisions R23).
const NO_REFRESH_ROUTES = [
  /^\/?auth\/web\/(login\/request|refresh|logout|resend-verification)$/,
  /^\/?auth\/token\//,
  /^\/?auth\/(login-link|confirm-email)$/,
];

const isPublicAuthRoute = (url = ''): boolean =>
  NO_REFRESH_ROUTES.some((pattern) => pattern.test(url.replace(/^\/+/, '')));

// Listeners: the AuthContext logs out on a failed refresh; the maintenance screen listens for 503;
// a 403 AUTH_004 (organization suspended, account disabled) ends the session on a dedicated screen.
type Listener = () => void;
const sessionEndedListeners = new Set<Listener>();
const maintenanceListeners = new Set<Listener>();
const accessBlockedListeners = new Set<Listener>();

export const apiEvents = {
  onSessionEnded: (listener: Listener): (() => void) => {
    sessionEndedListeners.add(listener);
    return () => sessionEndedListeners.delete(listener);
  },
  onMaintenance: (listener: Listener): (() => void) => {
    maintenanceListeners.add(listener);
    return () => maintenanceListeners.delete(listener);
  },
  onAccessBlocked: (listener: Listener): (() => void) => {
    accessBlockedListeners.add(listener);
    return () => accessBlockedListeners.delete(listener);
  },
};

interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

// One refresh at a time: every request that gets a 401 while it runs waits for the same promise, so a
// burst of requests never presents the same cookie twice.
let refreshing: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!refreshing) {
    refreshing = API.post<RefreshResponse>('/auth/web/refresh')
      .then((res) => {
        tokenStore.set(res.data.accessToken);
        return res.data.accessToken;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

API.interceptors.request.use((request) => {
  const token = tokenStore.get();
  if (token && !request.headers.Authorization) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<IBusinessException<string>>) => {
    const status = error?.response?.status;
    const original = error.config as AxiosRequestConfig & { _retried?: boolean };

    // The cutover window: the API answers 503 MAINTENANCE to everyone outside the allow-list (R2).
    if (status === 503 && error.response?.data?.code_error === 'MAINTENANCE') {
      maintenanceListeners.forEach((listener) => listener());
      throw error;
    }

    // The organization was suspended (or the admin disabled) mid-session: every request would fail
    // the same way, so the session ends once instead of a toast on every page. On the public auth
    // routes and the login forms (no bearer yet) AUTH_004 is an answer the page shows itself.
    if (
      status === 403 &&
      error.response?.data?.code_error === 'AUTH_004' &&
      !!original?.headers?.Authorization &&
      !isPublicAuthRoute(original?.url)
    ) {
      tokenStore.clear();
      accessBlockedListeners.forEach((listener) => listener());
      throw error;
    }

    if (status === 401 && original && !original._retried && !isPublicAuthRoute(original.url)) {
      original._retried = true;
      try {
        const token = await refreshAccessToken();
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return API(original);
      } catch {
        tokenStore.clear();
        sessionEndedListeners.forEach((listener) => listener());
      }
    }

    throw error;
  },
);

export default API;
