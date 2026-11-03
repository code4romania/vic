import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';
import { Test } from 'supertest';
import { api, emailedCode, linkSecret } from './utils/http';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// A volunteer's whole life in the app against the real API and database, emails read from the fake mailbox.
describe('Mobile auth (e2e)', () => {
  let testApp: TestApp;
  let http: ReturnType<typeof api>;
  const EMAIL = 'elena@example.ro';
  const PASSWORD = 'Volunteer#2026';

  const register = (email = EMAIL): Test =>
    http
      .post('/mobile/auth/register')
      .send({ email, password: PASSWORD, phone: '+40720000001' });

  const login = (password = PASSWORD, email = EMAIL): Test =>
    http.post('/mobile/auth/login').send({ email, password });

  // Registered, confirmed and logged in; returns the tokens.
  const confirmedVolunteer = async (): Promise<{
    accessToken: string;
    refreshToken: string;
  }> => {
    await register().expect(201);
    await http
      .post('/auth/confirm-email')
      .send({ token: linkSecret(testApp.mailbox.last(EMAIL)) })
      .expect(200);
    return (await login().expect(200)).body;
  };

  beforeAll(async () => {
    testApp = await createTestApp();
    http = api(testApp.app);
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    testApp.mailbox.clear();
    await truncate(testApp.dataSource, [
      'auth_identity',
      'user',
      'organization',
    ]);
    await testApp.dataSource.query(`DELETE FROM notifications_settings`);
  });

  it('register → confirmation link → confirm → login → no profile yet → create profile', async () => {
    const registered = await register('  Elena@Example.RO ').expect(201);
    expect(registered.body).toEqual({
      maskedEmail: 'e•••@example.ro',
      phone: '+40720000001',
    });

    const confirm = linkSecret(testApp.mailbox.last(EMAIL));
    const before = await login().expect(403);
    expect(before.body.code_error).toBe('AUTH_003');

    const info = await http.get(`/auth/token/${confirm}`).expect(200);
    expect(info.body).toEqual({
      type: 'verify_email',
      purpose: 'verify_email',
      realm: 'mobile',
      maskedEmail: 'e•••@example.ro',
    });

    const confirmed = await http
      .post('/auth/confirm-email')
      .send({ token: confirm })
      .expect(200);
    expect(confirmed.body).toEqual({ realm: 'mobile', email: EMAIL });
    const [{ count }] = await testApp.dataSource.query(
      'SELECT count(*)::int AS count FROM refresh_token',
    );
    expect(count).toBe(0);

    const { accessToken, refreshToken } = (await login().expect(200)).body;
    expect(refreshToken).toEqual(expect.any(String));

    const noProfile = await http
      .get('/mobile/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
    expect(noProfile.body.code_error).toBe('USER_001');

    await http
      .post('/mobile/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: 'Elena',
        lastName: 'Voluntar',
        email: 'someone-else@example.ro',
        phone: '+40720000001',
      })
      .expect(201);

    const profile = await http
      .get('/mobile/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    // The profile takes the confirmed login email, never the one in the body.
    expect(profile.body.email).toBe(EMAIL);

    await http
      .post('/mobile/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: 'Again',
        lastName: 'Again',
        email: EMAIL,
        phone: '+40720000002',
      })
      .expect(400);
  });

  it('a second registration with the same email is AUTH_009', async () => {
    await register().expect(201);

    const again = await register(EMAIL.toUpperCase()).expect(409);
    expect(again.body.code_error).toBe('AUTH_009');
  });

  it('a profile-less volunteer cannot delete or change anyone: USER_001', async () => {
    await testApp.dataSource.query(
      `INSERT INTO "user" (type, cognito_id, name, email, phone, first_name, last_name)
       VALUES ('regular', 'someone', 'Other', 'other@example.ro', '+40799999999', 'Other', 'Person')`,
    );
    const { accessToken } = await confirmedVolunteer();
    const auth = { Authorization: `Bearer ${accessToken}` };

    expect(
      (await http.delete('/mobile/user').set(auth).expect(404)).body.code_error,
    ).toBe('USER_001');
    await http
      .patch('/mobile/user/personal-data')
      .set(auth)
      .send({})
      .expect((res) => {
        expect([400, 404]).toContain(res.status);
      });
    const [{ count }] = await testApp.dataSource.query(
      `SELECT count(*)::int AS count FROM "user" WHERE deleted_on IS NULL`,
    );
    expect(count).toBe(1);
  });

  it('forgot password: a code, five wrong tries end it, a new code logs in and ends the other sessions', async () => {
    const first = await confirmedVolunteer();
    testApp.mailbox.clear();

    await http
      .post('/mobile/auth/forgot-password')
      .send({ email: EMAIL })
      .expect(200);
    const code = emailedCode(testApp.mailbox.last(EMAIL));
    expect(code).toMatch(/^\d{6}$/);
    const wrong = code === '000000' ? '000001' : '000000';

    for (let attempt = 1; attempt <= 4; attempt++) {
      const res = await http
        .post('/mobile/auth/reset-password')
        .send({ email: EMAIL, code: wrong, password: 'Changed#2026' })
        .expect(400);
      expect(res.body.code_error).toBe('AUTH_005');
    }
    const fifth = await http
      .post('/mobile/auth/reset-password')
      .send({ email: EMAIL, code: wrong, password: 'Changed#2026' })
      .expect(400);
    expect(fifth.body.code_error).toBe('AUTH_006');

    // A new code a minute later (one a minute per type).
    jest.useFakeTimers({
      doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'setInterval'],
      now: Date.now() + 61000,
    });
    try {
      await http
        .post('/mobile/auth/forgot-password')
        .send({ email: EMAIL })
        .expect(200);
    } finally {
      jest.useRealTimers();
    }
    const fresh = emailedCode(testApp.mailbox.last(EMAIL));
    const reset = await http
      .post('/mobile/auth/reset-password')
      .send({ email: EMAIL, code: fresh, password: 'Changed#2026' })
      .expect(200);
    expect(reset.body.accessToken).toEqual(expect.any(String));
    expect(testApp.mailbox.last(EMAIL).subject).toContain('schimbată');

    const oldRefresh = await http
      .post('/mobile/auth/refresh')
      .send({ refreshToken: first.refreshToken })
      .expect(401);
    expect(oldRefresh.body.code_error).toBe('AUTH_008');
    await login('Changed#2026').expect(200);
    expect((await login().expect(401)).body.code_error).toBe('AUTH_001');
  });

  it('change password keeps this session and ends the others', async () => {
    const current = await confirmedVolunteer();
    const other = (await login().expect(200)).body;
    const auth = { Authorization: `Bearer ${current.accessToken}` };

    const badCurrent = await http
      .patch('/mobile/auth/change-password')
      .set(auth)
      .send({ currentPassword: 'Wrong#2026', newPassword: 'Changed#2026' })
      .expect(401);
    expect(badCurrent.body.code_error).toBe('AUTH_001');

    await http
      .patch('/mobile/auth/change-password')
      .set(auth)
      .send({ currentPassword: PASSWORD, newPassword: 'Changed#2026' })
      .expect(204);

    await http
      .post('/mobile/auth/refresh')
      .send({ refreshToken: other.refreshToken })
      .expect(401);
    const rotated = await http
      .post('/mobile/auth/refresh')
      .send({ refreshToken: current.refreshToken })
      .expect(200);
    expect(rotated.body.refreshToken).not.toBe(current.refreshToken);
  });

  it('logout ends the session', async () => {
    const { refreshToken } = await confirmedVolunteer();

    await http.post('/mobile/auth/logout').send({ refreshToken }).expect(204);
    await http.post('/mobile/auth/refresh').send({ refreshToken }).expect(401);
  });

  it('five wrong passwords lock the login: AUTH_002 even with the right one', async () => {
    await confirmedVolunteer();

    for (let attempt = 1; attempt <= 5; attempt++) {
      await login('Wrong#2026').expect(401);
    }
    const locked = await login().expect(423);
    expect(locked.body.code_error).toBe('AUTH_002');
  });

  it('delete account removes the login, its sessions and lets the email register again', async () => {
    const { accessToken, refreshToken } = await confirmedVolunteer();
    const auth = { Authorization: `Bearer ${accessToken}` };
    await http
      .post('/mobile/user')
      .set(auth)
      .send({
        firstName: 'Elena',
        lastName: 'Voluntar',
        email: EMAIL,
        phone: '+40720000001',
      })
      .expect(201);

    await http.delete('/mobile/user').set(auth).expect(200);

    await expect(
      testApp.app
        .get(AuthIdentityFacade)
        .findIdentity({ realm: AuthRealm.MOBILE, email: EMAIL }),
    ).resolves.toBeNull();
    await http.post('/mobile/auth/refresh').send({ refreshToken }).expect(401);
    await register().expect(201);
  });

  it('forgot password and resend for an unknown email answer 200 and send nothing', async () => {
    await http
      .post('/mobile/auth/forgot-password')
      .send({ email: 'nobody@example.ro' })
      .expect(200);
    await http
      .post('/mobile/auth/resend-verification')
      .send({ email: 'nobody@example.ro' })
      .expect(200);

    expect(testApp.mailbox.sent).toHaveLength(0);
  });
});
