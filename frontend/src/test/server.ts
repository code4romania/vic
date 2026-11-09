import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { IAdminProfile } from '../common/interfaces/auth.interface';

export const API_URL = 'http://api.test';
export const api = (path: string): string => `${API_URL}${path}`;

export const ADMIN: IAdminProfile = {
  id: 'admin-1',
  name: 'Ana Admin',
  email: 'ana@ong.test',
  phone: '+40700000000',
  organizationId: 'org-1',
  superAdmin: false,
};

export const businessError = (status: number, code_error: string) =>
  HttpResponse.json({ statusCode: status, code_error, message: code_error }, { status });

// The happy path of every route the web app calls; a spec overrides what it tests with server.use().
export const handlers = [
  http.post(api('/auth/web/refresh'), () => businessError(401, 'AUTH_008')),
  http.post(api('/auth/web/login/request'), () => new HttpResponse(null, { status: 204 })),
  http.post(api('/auth/web/logout'), () => new HttpResponse(null, { status: 204 })),
  http.get(api('/auth/web/me'), () => HttpResponse.json(ADMIN)),
  http.post(api('/auth/web/resend-verification'), () => new HttpResponse(null, { status: 200 })),
  http.get(api('/auth/token/:secret'), () =>
    HttpResponse.json({
      type: 'login',
      purpose: 'login',
      realm: 'web',
      maskedEmail: 'a•••@ong.test',
    }),
  ),
  http.post(api('/auth/token/:secret/resend'), () => new HttpResponse(null, { status: 200 })),
  http.post(api('/auth/login-link'), () =>
    HttpResponse.json({ accessToken: 'access-2', expiresIn: 900, user: ADMIN }),
  ),
  http.post(api('/auth/confirm-email'), () =>
    HttpResponse.json({ accessToken: 'access-3', expiresIn: 900, user: ADMIN }),
  ),
  http.get(api('/organization'), () =>
    HttpResponse.json({
      id: 'org-1',
      name: 'Asociatia Test',
      email: 'contact@ong.test',
      phone: '+40700000001',
      address: 'Str. Test 1',
      activityArea: 'Social',
      logo: '',
      description: 'd'.repeat(60),
      status: 'active',
      validatedAt: '2026-11-01T10:00:00.000Z',
      taxId: 'RO123456',
      website: null,
      statuteUrl: null,
    }),
  ),
  http.get(api('/organization/team'), () => HttpResponse.json([])),
  http.post(api('/organizations/register'), () =>
    HttpResponse.json({ maskedEmail: 't•••@ong.test' }, { status: 201 }),
  ),
  http.get(api('/admin/organizations/pending-validation'), () => HttpResponse.json([])),
];

export const server = setupServer(...handlers);
