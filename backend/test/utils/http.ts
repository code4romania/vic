import { INestApplication } from '@nestjs/common';
import { ISendMailOptions } from '@nestjs-modules/mailer';
import * as request from 'supertest';

let counter = 0;

// Each request comes from its own address, so the per-IP throttle on the auth routes does not trip the
// suites; the throttle itself is not what they test.
export function api(app: INestApplication): {
  get: (url: string) => request.Test;
  post: (url: string) => request.Test;
  patch: (url: string) => request.Test;
  delete: (url: string) => request.Test;
} {
  const server = app.getHttpServer();
  const from = (test: request.Test): request.Test =>
    test.set(
      'X-Forwarded-For',
      `10.0.${Math.floor(++counter / 250) % 250}.${counter % 250}`,
    );

  return {
    get: (url) => from(request(server).get(url)),
    post: (url) => from(request(server).post(url)),
    patch: (url) => from(request(server).patch(url)),
    delete: (url) => from(request(server).delete(url)),
  };
}

// The secret in an emailed link, read the way a user would read it.
export function linkSecret(email: ISendMailOptions): string {
  const link: string = email?.context?.cta?.link;
  const secret = link && new URL(link).searchParams.get('token');
  if (!secret) throw new Error(`no link in email "${email?.subject}"`);
  return secret;
}

export function emailedCode(email: ISendMailOptions): string {
  const code: string = email?.context?.code;
  if (!code) throw new Error(`no code in email "${email?.subject}"`);
  return code;
}

// The vic_refresh value from a response's Set-Cookie, or undefined.
export function refreshCookie(response: request.Response): string {
  const cookies = [].concat(response.headers['set-cookie'] ?? []);
  const cookie = cookies.find((value: string) =>
    value.startsWith('vic_refresh='),
  );
  return cookie;
}

// Logs a web admin in through the API; the access token and the refresh cookie (for /auth/web/refresh).
export async function asWeb(
  http: ReturnType<typeof api>,
  email: string,
  password: string,
): Promise<{
  accessToken: string;
  cookie: string;
  auth: { Authorization: string };
}> {
  const res = await http.post('/auth/web/login').send({ email, password });
  if (res.status !== 200) {
    throw new Error(
      `web login ${email}: ${res.status} ${JSON.stringify(res.body)}`,
    );
  }
  return {
    accessToken: res.body.accessToken,
    cookie: refreshCookie(res).split(';')[0],
    auth: { Authorization: `Bearer ${res.body.accessToken}` },
  };
}

// Logs a volunteer in through the API; both tokens, as the app keeps them.
export async function asMobile(
  http: ReturnType<typeof api>,
  email: string,
  password: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  auth: { Authorization: string };
}> {
  const res = await http.post('/mobile/auth/login').send({ email, password });
  if (res.status !== 200) {
    throw new Error(
      `mobile login ${email}: ${res.status} ${JSON.stringify(res.body)}`,
    );
  }
  return {
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
    auth: { Authorization: `Bearer ${res.body.accessToken}` },
  };
}
