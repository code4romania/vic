import { AUTH_TOKEN_TTL_MS } from 'src/modules/auth/auth.constants';
import {
  AuthIdentityStatus,
  AuthRealm,
  AuthTokenForm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { Response, Test } from 'supertest';
import { api, linkSecret, refreshCookie } from './utils/http';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// VIC 2.0 (#514): magic link login for admins, the web session cookie and the web-only rules.
describe('Web auth (e2e)', () => {
  let testApp: TestApp;
  let http: ReturnType<typeof api>;
  let facade: AuthIdentityFacade;
  let admin: IAuthIdentityModel;
  let organizationId: string;
  let transitionSecret: string;
  const EMAIL = 'ana@example.ro';

  // The shape the cutover import leaves behind: a pending web login and a 30-day invite nobody sent.
  const migrateAdmin = async (): Promise<void> => {
    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Asociatia Test', 'org@example.ro', '+40700000000', 'active', now()) RETURNING id`,
    );
    organizationId = organization.id;
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, cognito_id, name, email, phone, organization_id)
       VALUES ('admin', 'legacy', 'Ana Admin', $1, '+40711111111', $2) RETURNING id`,
      [EMAIL, organizationId],
    );
    admin = await facade.createIdentity({
      realm: AuthRealm.WEB,
      email: EMAIL,
      status: AuthIdentityStatus.PENDING,
      userId: user.id,
      emailVerifiedAt: new Date(),
    });
    transitionSecret = (
      await testApp.app.get(OneTimeTokenService).issue({
        identity: admin,
        type: AuthTokenType.INVITE,
        form: AuthTokenForm.LINK,
        ttlMs: AUTH_TOKEN_TTL_MS.TRANSITION_LINK,
      })
    ).secret;
  };

  // VIC 2.0 (#514): a login is "email me a link", then the link.
  const requestLink = (email = EMAIL): Test =>
    http.post('/auth/web/login/request').send({ email });
  const useLink = (token: string): Test =>
    http.post('/auth/login-link').send({ token });
  const login = async (email = EMAIL): Promise<Response> => {
    await testApp.flushRedis(); // one login email a minute per login
    await requestLink(email).expect(204);
    return useLink(linkSecret(testApp.mailbox.last(email))).expect(200);
  };

  beforeAll(async () => {
    testApp = await createTestApp();
    http = api(testApp.app);
    facade = testApp.app.get(AuthIdentityFacade);
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'auth_identity',
      'user',
      'organization',
    ]);
    await migrateAdmin();
    testApp.mailbox.clear();
  });

  it('login request: a magic link for an admin; the same 204 and no email for an unknown address', async () => {
    await requestLink().expect(204);
    const email = testApp.mailbox.last(EMAIL);
    expect(email.subject).toContain('Linkul tău de autentificare');
    expect(email.context.cta.link).toMatch(
      /^https:\/\/vic\.test\/login\/link\?token=/,
    );

    testApp.mailbox.clear();
    await requestLink('nobody@example.ro').expect(204);
    expect(testApp.mailbox.sent).toHaveLength(0);
  });

  it('magic link → token info → session cookie → me; the link works once', async () => {
    await requestLink().expect(204);
    const secret = linkSecret(testApp.mailbox.last(EMAIL));

    const info = await http.get(`/auth/token/${secret}`).expect(200);
    expect(info.body).toMatchObject({
      type: 'login',
      purpose: 'login',
      realm: 'web',
      maskedEmail: 'a•••@example.ro',
    });

    const lastLogin = async (): Promise<Date> =>
      (await facade.findIdentity({ realm: AuthRealm.WEB, email: EMAIL }))
        .lastLoginAt;
    expect(await lastLogin()).toBeNull();

    const used = await useLink(secret).expect(200);
    expect(used.body.user).toMatchObject({
      email: EMAIL,
      organizationId,
      superAdmin: false,
    });
    expect(used.body.refreshToken).toBeUndefined();
    expect(await lastLogin()).toBeInstanceOf(Date);
    const cookie = refreshCookie(used);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/Path=\/auth\/web/);
    expect(cookie).toMatch(/SameSite=Lax/);

    // the first login activates a pending login
    expect(
      (await facade.findIdentity({ realm: AuthRealm.WEB, email: EMAIL }))
        .status,
    ).toBe(AuthIdentityStatus.ACTIVE);

    const me = await http
      .get('/auth/web/me')
      .set('Authorization', `Bearer ${used.body.accessToken}`)
      .expect(200);
    expect(me.body).toMatchObject({ email: EMAIL, organizationId });

    const reused = await useLink(secret).expect(400);
    expect(reused.body.code_error).toBe('AUTH_005');
    await http.get(`/auth/token/${secret}`).expect(400);
  });

  it('the transition link logs in once and ends a login link sent before it is used', async () => {
    const info = await http.get(`/auth/token/${transitionSecret}`).expect(200);
    expect(info.body).toEqual({
      type: 'invite',
      purpose: 'transition',
      realm: 'web',
      maskedEmail: 'a•••@example.ro',
      organizationName: 'Asociatia Test',
    });

    await requestLink().expect(204);
    const loginLink = linkSecret(testApp.mailbox.last(EMAIL));

    await useLink(transitionSecret).expect(200);
    // logging in with either one ends the other
    await useLink(loginLink).expect(400);
    await useLink(transitionSecret).expect(400);
  });

  it('a newer login link ends the earlier one; an expired link is AUTH_005', async () => {
    await requestLink().expect(204);
    const earlier = linkSecret(testApp.mailbox.last(EMAIL));
    await testApp.flushRedis();
    await requestLink().expect(204);
    const newer = linkSecret(testApp.mailbox.last(EMAIL));

    await http.get(`/auth/token/${earlier}`).expect(400);
    await http.get(`/auth/token/${newer}`).expect(200);

    await testApp.dataSource.query(
      `UPDATE auth_token SET expires_at = now() - interval '1 second' WHERE type = 'login'`,
    );
    expect((await useLink(newer).expect(400)).body.code_error).toBe('AUTH_005');
  });

  it('one login email a minute: a second request inside the minute sends nothing and still answers 204', async () => {
    await testApp.flushRedis();
    await requestLink().expect(204);
    await requestLink().expect(204);
    expect(testApp.mailbox.to(EMAIL)).toHaveLength(1);
  });

  it('the password routes are gone', async () => {
    await http
      .post('/auth/web/login')
      .send({ email: EMAIL, password: 'Admin#2026x' })
      .expect(404);
    await http.post('/auth/web/forgot-password').expect(404);
    await http.patch('/auth/web/change-password').expect(404);
    await http.post('/auth/set-password').expect(404);
  });

  it('refresh rotates the cookie; without a cookie it is AUTH_008 and the cookie is cleared; logout ends it', async () => {
    const logged = await login();
    const first = refreshCookie(logged).split(';')[0];

    const refreshed = await http
      .post('/auth/web/refresh')
      .set('Cookie', first)
      .expect(200);
    expect(refreshed.body.accessToken).toEqual(expect.any(String));
    const second = refreshCookie(refreshed).split(';')[0];
    expect(second).not.toBe(first);

    const missing = await http.post('/auth/web/refresh').expect(401);
    expect(missing.body.code_error).toBe('AUTH_008');
    expect(refreshCookie(missing)).toMatch(/vic_refresh=;/);

    const out = await http
      .post('/auth/web/logout')
      .set('Cookie', second)
      .expect(204);
    expect(refreshCookie(out)).toMatch(/vic_refresh=;/);
    await http.post('/auth/web/refresh').set('Cookie', second).expect(401);
  });

  it('a volunteer on the web login is sent to the app: AUTH_012', async () => {
    await facade.createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'elena@example.ro',
      status: AuthIdentityStatus.ACTIVE,
    });

    const res = await requestLink('elena@example.ro').expect(409);
    expect(res.body.code_error).toBe('AUTH_012');
  });

  it('a disabled admin gets no email, and a link sent before is refused with AUTH_004', async () => {
    await facade.updateIdentity(admin.id, {
      status: AuthIdentityStatus.DISABLED,
    });

    await requestLink().expect(204);
    expect(testApp.mailbox.sent).toHaveLength(0);
    const res = await useLink(transitionSecret).expect(403);
    expect(res.body.code_error).toBe('AUTH_004');
  });

  it('an admin of a suspended NGO cannot log in: AUTH_004', async () => {
    await testApp.dataSource.query(
      `UPDATE organization SET status = 'suspended' WHERE id = $1`,
      [organizationId],
    );
    const res = await useLink(transitionSecret).expect(403);
    expect(res.body.code_error).toBe('AUTH_004');
  });

  it('resend on an expired transition link sends a fresh 30-day one; once logged in, nothing', async () => {
    await testApp.dataSource.query(
      `UPDATE auth_token SET expires_at = now() - interval '1 day'`,
    );
    await http.get(`/auth/token/${transitionSecret}`).expect(400);

    await http.post(`/auth/token/${transitionSecret}/resend`).expect(200);
    const fresh = linkSecret(testApp.mailbox.last(EMAIL));
    const info = await http.get(`/auth/token/${fresh}`).expect(200);
    expect(info.body.purpose).toBe('transition');

    await useLink(fresh).expect(200);
    testApp.mailbox.clear();
    await testApp.flushRedis();
    await http.post(`/auth/token/${fresh}/resend`).expect(200);
    await http.post(`/auth/token/${'A'.repeat(43)}/resend`).expect(200);
    expect(testApp.mailbox.sent).toHaveLength(0);
  });

  const cookieOf = (res: { headers: Record<string, unknown> }): string =>
    refreshCookie(res as never).split(';')[0];

  it('a rotated cookie presented again: within 10 s it is two tabs crossing (200), later a replay that ends the session', async () => {
    const first = cookieOf(await login());
    const second = cookieOf(
      await http.post('/auth/web/refresh').set('Cookie', first).expect(200),
    );

    // 3 s later: the other tab still gets in.
    await testApp.dataSource.query(
      `UPDATE refresh_token SET rotated_at = now() - interval '3 seconds'`,
    );
    const crossing = await http
      .post('/auth/web/refresh')
      .set('Cookie', first)
      .expect(200);
    expect(crossing.body.accessToken).toEqual(expect.any(String));

    // 11 s later: a replay; the session is revoked, so even the current cookie stops working.
    await testApp.dataSource.query(
      `UPDATE refresh_token SET rotated_at = now() - interval '11 seconds'`,
    );
    const replay = await http
      .post('/auth/web/refresh')
      .set('Cookie', first)
      .expect(401);
    expect(replay.body.code_error).toBe('AUTH_008');
    const [{ revoked }] = await testApp.dataSource.query(
      `SELECT count(*)::int AS revoked FROM refresh_token WHERE revoked_at IS NOT NULL`,
    );
    expect(revoked).toBe(1);
    const current = refreshCookie(crossing) ? cookieOf(crossing) : second;
    await http.post('/auth/web/refresh').set('Cookie', current).expect(401);
  });

  it('resend-verification for an unknown or already confirmed email sends nothing', async () => {
    await http
      .post('/auth/web/resend-verification')
      .send({ email: 'nobody@example.ro' })
      .expect(200);
    await http
      .post('/auth/web/resend-verification')
      .send({ email: EMAIL })
      .expect(200);
    expect(testApp.mailbox.sent).toHaveLength(0);
  });

  it('disabling an admin: refresh 401, the earlier access token refused, no new login (R18)', async () => {
    const logged = await login();
    const auth = { Authorization: `Bearer ${logged.body.accessToken}` };
    await http.get('/auth/web/me').set(auth).expect(200);

    await facade.updateIdentity(admin.id, {
      status: AuthIdentityStatus.DISABLED,
    });

    await http
      .post('/auth/web/refresh')
      .set('Cookie', cookieOf(logged))
      .expect(401);
    await http.get('/auth/web/me').set(auth).expect(401);
    testApp.mailbox.clear();
    await testApp.flushRedis();
    await requestLink().expect(204);
    expect(testApp.mailbox.sent).toHaveLength(0);
  });

  it('the old Cognito bootstrap route is gone and the mobile version is public', async () => {
    await http.post('/auth/login').expect(404);

    const version = await http.get('/public/mobile-version').expect(200);
    expect(version.body).toEqual({ minVersion: '1.1.0' });
  });
});
