import { http, HttpResponse } from 'msw';
import API, { apiEvents } from './api';
import { tokenStore } from './auth/token.store';
import { api, businessError, server } from '../test/server';

// GET /volunteer answers 401 until the access token is the refreshed one.
const protectedRoute = (path: string) =>
  http.all(api(path), ({ request }) =>
    request.headers.get('authorization') === 'Bearer fresh'
      ? HttpResponse.json({ ok: true })
      : businessError(401, 'AUTH_008'),
  );

describe('API client', () => {
  it('adds the bearer from memory', async () => {
    let seen: string | null = null;
    server.use(
      http.get(api('/volunteer'), ({ request }) => {
        seen = request.headers.get('authorization');
        return HttpResponse.json([]);
      }),
    );
    tokenStore.set('access-1');
    await API.get('/volunteer');
    expect(seen).toBe('Bearer access-1');
  });

  it('runs one refresh for three parallel 401s, then retries each', async () => {
    let refreshes = 0;
    server.use(
      protectedRoute('/volunteer'),
      http.post(api('/auth/web/refresh'), async () => {
        refreshes++;
        await new Promise((resolve) => setTimeout(resolve, 20));
        return HttpResponse.json({ accessToken: 'fresh', expiresIn: 900 });
      }),
    );
    tokenStore.set('stale');

    const results = await Promise.all([
      API.get('/volunteer'),
      API.get('/volunteer'),
      API.get('/volunteer'),
    ]);

    expect(refreshes).toBe(1);
    expect(results.map((res) => res.data)).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(tokenStore.get()).toBe('fresh');
  });

  it('a failed refresh clears the token and ends the session', async () => {
    server.use(protectedRoute('/volunteer'));
    const ended = vi.fn();
    const off = apiEvents.onSessionEnded(ended);
    tokenStore.set('stale');

    await expect(API.get('/volunteer')).rejects.toMatchObject({ response: { status: 401 } });

    expect(tokenStore.get()).toBeNull();
    expect(ended).toHaveBeenCalledTimes(1);
    off();
  });

  it.each([
    ['post', '/auth/web/login/request'],
    ['post', '/auth/web/refresh'],
    ['post', '/auth/web/logout'],
    ['post', '/auth/web/resend-verification'],
    ['get', '/auth/token/abc'],
    ['post', '/auth/token/abc/resend'],
    ['post', '/auth/login-link'],
    ['post', '/auth/confirm-email'],
  ])('never refreshes on a 401 from the public route %s %s (R23)', async (method, path) => {
    let calls = 0;
    let refreshes = 0;
    server.use(
      http.all(api(path), () => {
        calls++;
        return businessError(401, 'AUTH_001');
      }),
      http.post(api('/auth/web/refresh'), () => {
        refreshes++;
        return HttpResponse.json({ accessToken: 'fresh', expiresIn: 900 });
      }),
    );

    await expect(method === 'get' ? API.get(path) : API.post(path, {})).rejects.toMatchObject({
      response: { status: 401 },
    });
    // Called once, not retried, and no refresh in between.
    expect(calls).toBe(1);
    expect(refreshes).toBe(0);
  });

  it.each([
    ['get', '/auth/web/me'],
    ['patch', '/organization'],
  ])('refreshes on a 401 from %s %s (R23)', async (method, path) => {
    server.use(
      protectedRoute(path),
      http.post(api('/auth/web/refresh'), () =>
        HttpResponse.json({ accessToken: 'fresh', expiresIn: 900 }),
      ),
    );
    const res = method === 'get' ? await API.get(path) : await API.patch(path, {});
    expect(res.data).toEqual({ ok: true });
  });

  it('a 503 MAINTENANCE tells the maintenance listeners', async () => {
    server.use(http.get(api('/volunteer'), () => businessError(503, 'MAINTENANCE')));
    const maintenance = vi.fn();
    const off = apiEvents.onMaintenance(maintenance);

    await expect(API.get('/volunteer')).rejects.toMatchObject({ response: { status: 503 } });

    expect(maintenance).toHaveBeenCalledTimes(1);
    off();
  });
});
