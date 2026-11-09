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
import { Test } from 'supertest';
import { api, linkSecret, refreshCookie } from './utils/http';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// A migrated admin's way back in, the web session cookie and the web-only rules.
describe('Web auth (e2e)', () => {
  let testApp: TestApp;
  let http: ReturnType<typeof api>;
  let facade: AuthIdentityFacade;
  let admin: IAuthIdentityModel;
  let organizationId: string;
  let transitionSecret: string;
  const EMAIL = 'ana@example.ro';
  const PASSWORD = 'Admin#2026x';

  // The shape the cutover import leaves behind: a pending_password web login and a 30-day invite nobody sent.
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
      status: AuthIdentityStatus.PENDING_PASSWORD,
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

  const login = (password = PASSWORD, email = EMAIL): Test =>
    http.post('/auth/web/login').send({ email, password });

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

  it('the old password fails with AUTH_001 and sends nothing', async () => {
    const res = await login('OldCognito#1').expect(401);

    expect(res.body.code_error).toBe('AUTH_001');
    expect(testApp.mailbox.sent).toHaveLength(0);
  });

  it('transition link → token info → set password → session cookie → me', async () => {
    const info = await http.get(`/auth/token/${transitionSecret}`).expect(200);
    expect(info.body).toEqual({
      type: 'invite',
      purpose: 'transition',
      realm: 'web',
      maskedEmail: 'a•••@example.ro',
      organizationName: 'Asociatia Test',
    });

    const weak = await http
      .post('/auth/set-password')
      .send({ token: transitionSecret, password: 'weak' })
      .expect(400);
    expect(weak.body.code_error).toBeUndefined();
    const lastLogin = async (): Promise<Date> =>
      (await facade.findIdentity({ realm: AuthRealm.WEB, email: EMAIL }))
        .lastLoginAt;
    expect(await lastLogin()).toBeNull();

    const set = await http
      .post('/auth/set-password')
      .send({ token: transitionSecret, password: PASSWORD })
      .expect(200);
    expect(set.body.user).toMatchObject({
      email: EMAIL,
      organizationId,
      superAdmin: false,
    });
    expect(set.body.refreshToken).toBeUndefined();
    // the link's session counts as a login (Team page "last login")
    expect(await lastLogin()).toBeInstanceOf(Date);
    const cookie = refreshCookie(set);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/Path=\/auth\/web/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(testApp.mailbox.last(EMAIL).subject).toContain('schimbată');

    const me = await http
      .get('/auth/web/me')
      .set('Authorization', `Bearer ${set.body.accessToken}`)
      .expect(200);
    expect(me.body).toMatchObject({ email: EMAIL, organizationId });

    const reused = await http
      .post('/auth/set-password')
      .send({ token: transitionSecret, password: PASSWORD })
      .expect(400);
    expect(reused.body.code_error).toBe('AUTH_005');
    await http.get(`/auth/token/${transitionSecret}`).expect(400);

    await login().expect(200);
  });

  it('refresh rotates the cookie; without a cookie it is AUTH_008 and the cookie is cleared; logout ends it', async () => {
    await http
      .post('/auth/set-password')
      .send({ token: transitionSecret, password: PASSWORD })
      .expect(200);
    const logged = await login().expect(200);
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

  it('forgot password: a reset link that works once, and using it ends the transition link', async () => {
    await http
      .post('/auth/web/forgot-password')
      .send({ email: EMAIL })
      .expect(200);
    const reset = linkSecret(testApp.mailbox.last(EMAIL));

    const info = await http.get(`/auth/token/${reset}`).expect(200);
    expect(info.body.purpose).toBe('reset');
    // A reset link never ends the transition link...
    await http.get(`/auth/token/${transitionSecret}`).expect(200);

    await http
      .post('/auth/set-password')
      .send({ token: reset, password: PASSWORD })
      .expect(200);
    // ...but setting a password through either one ends the other.
    await http.get(`/auth/token/${transitionSecret}`).expect(400);
    await http
      .post('/auth/set-password')
      .send({ token: reset, password: PASSWORD })
      .expect(400);
  });

  it('a volunteer on the web login is sent to the app: AUTH_012', async () => {
    await facade.createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'elena@example.ro',
      status: AuthIdentityStatus.ACTIVE,
    });

    const res = await login(PASSWORD, 'elena@example.ro').expect(409);
    expect(res.body.code_error).toBe('AUTH_012');
  });

  it('a disabled admin: login AUTH_004, and the link no longer revives the login', async () => {
    await facade.updateIdentity(admin.id, {
      status: AuthIdentityStatus.DISABLED,
    });

    const set = await http
      .post('/auth/set-password')
      .send({ token: transitionSecret, password: PASSWORD })
      .expect(403);
    expect(set.body.code_error).toBe('AUTH_004');
  });

  it('change password needs the current one', async () => {
    const set = await http
      .post('/auth/set-password')
      .send({ token: transitionSecret, password: PASSWORD })
      .expect(200);
    const auth = { Authorization: `Bearer ${set.body.accessToken}` };

    await http
      .patch('/auth/web/change-password')
      .set(auth)
      .send({ currentPassword: 'Wrong#2026', newPassword: 'Changed#2026' })
      .expect(401);
    await http
      .patch('/auth/web/change-password')
      .set(auth)
      .send({ currentPassword: PASSWORD, newPassword: 'Changed#2026' })
      .expect(204);
    await login('Changed#2026').expect(200);
  });

  it('resend on an expired transition link sends a fresh 30-day one; on a used one, nothing', async () => {
    await testApp.dataSource.query(
      `UPDATE auth_token SET expires_at = now() - interval '1 day'`,
    );
    await http.get(`/auth/token/${transitionSecret}`).expect(400);

    await http.post(`/auth/token/${transitionSecret}/resend`).expect(200);
    const fresh = linkSecret(testApp.mailbox.last(EMAIL));
    const info = await http.get(`/auth/token/${fresh}`).expect(200);
    expect(info.body.purpose).toBe('transition');

    await http
      .post('/auth/set-password')
      .send({ token: fresh, password: PASSWORD })
      .expect(200);
    testApp.mailbox.clear();
    await http.post(`/auth/token/${fresh}/resend`).expect(200);
    await http.post(`/auth/token/${'A'.repeat(43)}/resend`).expect(200);
    expect(testApp.mailbox.sent).toHaveLength(0);
  });

  // Layer 10 additions.

  const activate = async (): Promise<void> => {
    await http
      .post('/auth/set-password')
      .send({ token: transitionSecret, password: PASSWORD })
      .expect(200);
  };
  const cookieOf = (res: { headers: Record<string, unknown> }): string =>
    refreshCookie(res as never).split(';')[0];

  it('five wrong passwords lock the login: 423 AUTH_002 even with the right one', async () => {
    await activate();

    for (let attempt = 1; attempt <= 5; attempt++) {
      expect((await login('Wrong#20266').expect(401)).body.code_error).toBe(
        'AUTH_001',
      );
    }
    expect((await login().expect(423)).body.code_error).toBe('AUTH_002');

    // The lock lasts 15 minutes.
    await testApp.dataSource.query(
      `UPDATE auth_identity SET locked_until = now() - interval '1 second'`,
    );
    await login().expect(200);
  });

  it('a rotated cookie presented again: within 10 s it is two tabs crossing (200), later a replay that ends the session', async () => {
    await activate();
    const first = cookieOf(await login().expect(200));
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

  it('change password keeps this session and ends the other', async () => {
    await activate();
    const here = await login().expect(200);
    const there = cookieOf(await login().expect(200));

    await http
      .patch('/auth/web/change-password')
      .set('Authorization', `Bearer ${here.body.accessToken}`)
      .send({ currentPassword: PASSWORD, newPassword: 'Changed#2026' })
      .expect(204);

    await http.post('/auth/web/refresh').set('Cookie', there).expect(401);
    await http
      .post('/auth/web/refresh')
      .set('Cookie', cookieOf(here))
      .expect(200);
  });

  it('a newer reset link ends the earlier one; forgot password for an unknown email sends nothing', async () => {
    await http
      .post('/auth/web/forgot-password')
      .send({ email: EMAIL })
      .expect(200);
    const earlier = linkSecret(testApp.mailbox.last(EMAIL));
    await testApp.flushRedis(); // one link a minute per type
    await http
      .post('/auth/web/forgot-password')
      .send({ email: EMAIL })
      .expect(200);
    const newer = linkSecret(testApp.mailbox.last(EMAIL));

    await http.get(`/auth/token/${earlier}`).expect(400);
    await http.get(`/auth/token/${newer}`).expect(200);

    testApp.mailbox.clear();
    await http
      .post('/auth/web/forgot-password')
      .send({ email: 'nobody@example.ro' })
      .expect(200);
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

  it('disabling an admin: login 403 AUTH_004, refresh 401, the earlier access token refused (R18)', async () => {
    await activate();
    const logged = await login().expect(200);
    const auth = { Authorization: `Bearer ${logged.body.accessToken}` };
    await http.get('/auth/web/me').set(auth).expect(200);

    await facade.updateIdentity(admin.id, {
      status: AuthIdentityStatus.DISABLED,
    });

    expect((await login().expect(403)).body.code_error).toBe('AUTH_004');
    await http
      .post('/auth/web/refresh')
      .set('Cookie', cookieOf(logged))
      .expect(401);
    await http.get('/auth/web/me').set(auth).expect(401);
  });

  it('the old Cognito bootstrap route is gone and the mobile version is public', async () => {
    await http.post('/auth/login').expect(404);

    const version = await http.get('/public/mobile-version').expect(200);
    expect(version.body).toEqual({ minVersion: '1.1.0' });
  });
});
