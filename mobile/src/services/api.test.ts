import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import API, { isPublicAuthRoute } from './api';
import { authEvents } from './auth/auth.events';
import { getAccessToken, getRefreshToken, setTokens } from './auth/token.storage';
import useStore from '../store/store';

type Handler = (config: InternalAxiosRequestConfig) => { status: number; data?: unknown };

const calls: InternalAxiosRequestConfig[] = [];

// Answers every request from `handler`, like the network would.
const serve = (handler: Handler) => {
  API.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    calls.push(config);
    const { status, data } = handler(config);
    const response = { status, data, statusText: '', headers: {}, config };
    if (status >= 400) {
      throw new AxiosError(`HTTP ${status}`, String(status), config, null, response as any);
    }
    return response;
  };
};

const bearer = (config: InternalAxiosRequestConfig) =>
  AxiosHeaders.from(config.headers).get('Authorization');

beforeEach(async () => {
  calls.length = 0;
  useStore.setState({ maintenance: false, updateRequired: false });
  await setTokens({ accessToken: 'old-access', refreshToken: 'refresh-1' });
});

describe('API client', () => {
  it('sends the bearer and x-app-version on every request', async () => {
    serve(() => ({ status: 200, data: {} }));

    await API.get('/mobile/user/profile');

    expect(bearer(calls[0])).toBe('Bearer old-access');
    expect(AxiosHeaders.from(calls[0].headers).get('x-app-version')).toBe('1.1.0');
  });

  it('refreshes once for parallel 401s and retries each request with the new token', async () => {
    serve((config) => {
      if (config.url === '/mobile/auth/refresh') {
        return { status: 200, data: { accessToken: 'new-access', refreshToken: 'refresh-2' } };
      }
      return bearer(config) === 'Bearer new-access' ? { status: 200, data: 'ok' } : { status: 401 };
    });

    const results = await Promise.all([
      API.get('/mobile/user/profile'),
      API.get('/mobile/event'),
      API.get('/mobile/news'),
    ]);

    expect(results.map((r) => r.data)).toEqual(['ok', 'ok', 'ok']);
    const refreshes = calls.filter((c) => c.url === '/mobile/auth/refresh');
    expect(refreshes).toHaveLength(1);
    expect(JSON.parse(refreshes[0].data)).toEqual({ refreshToken: 'refresh-1' });
    expect(await getAccessToken()).toBe('new-access');
    expect(await getRefreshToken()).toBe('refresh-2');
  });

  it('ends the session when the backend refuses the refresh token', async () => {
    const onLogout = jest.fn();
    const off = authEvents.on('logout', onLogout);
    serve(() => ({ status: 401, data: { code_error: 'AUTH_008' } }));

    await expect(API.get('/mobile/user/profile')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(await getAccessToken()).toBeNull();
    expect(await getRefreshToken()).toBeNull();
    off();
  });

  it('keeps the session when the refresh fails for another reason (offline, 5xx)', async () => {
    const onLogout = jest.fn();
    const off = authEvents.on('logout', onLogout);
    serve((config) => (config.url === '/mobile/auth/refresh' ? { status: 500 } : { status: 401 }));

    await expect(API.get('/mobile/user/profile')).rejects.toBeDefined();

    expect(onLogout).not.toHaveBeenCalled();
    expect(await getRefreshToken()).toBe('refresh-1');
    off();
  });

  it('never refreshes on a 401 from a public auth route', async () => {
    serve(() => ({ status: 401, data: { code_error: 'AUTH_001' } }));

    await expect(
      API.post('/mobile/auth/login/code', { email: 'a@b.ro', code: '123456' }),
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(calls.map((c) => c.url)).toEqual(['/mobile/auth/login/code']);
    expect(await getRefreshToken()).toBe('refresh-1');
  });

  it('treats only the public auth routes as public (#514)', () => {
    expect(isPublicAuthRoute('/mobile/auth/login/request')).toBe(true);
    expect(isPublicAuthRoute('/mobile/auth/login/code')).toBe(true);
    expect(isPublicAuthRoute('/mobile/user/profile')).toBe(false);
  });

  it('sets updateRequired on 426', async () => {
    serve(() => ({ status: 426, data: { code_error: 'AUTH_011' } }));

    await expect(API.get('/mobile/user/profile')).rejects.toBeDefined();

    expect(useStore.getState().updateRequired).toBe(true);
  });

  it('sets maintenance on 503 and clears it on the next answer', async () => {
    serve(() => ({ status: 503, data: { code_error: 'MAINTENANCE' } }));
    await expect(API.get('/mobile/user/profile')).rejects.toBeDefined();
    expect(useStore.getState().maintenance).toBe(true);

    serve(() => ({ status: 200, data: {} }));
    await API.get('/mobile/user/profile');
    expect(useStore.getState().maintenance).toBe(false);
  });
});
