import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { Response, Test } from 'supertest';
import { api, emailedCode } from './utils/http';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// VIC 2.0 (#514): a volunteer's whole life in the app against the real API and database, with the login
// code read from the fake mailbox. No passwords: email -> 6-digit code -> session.
describe('Mobile auth (e2e)', () => {
  let testApp: TestApp;
  let http: ReturnType<typeof api>;
  const EMAIL = 'elena@example.ro';

  const requestCode = (email = EMAIL): Test =>
    http.post('/mobile/auth/login/request').send({ email });
  const loginWithCode = (code: string, email = EMAIL): Test =>
    http.post('/mobile/auth/login/code').send({ email, code });

  // Asks for a code and logs in with it; returns the tokens.
  const loggedIn = async (
    email = EMAIL,
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    await testApp.flushRedis(); // one code a minute per login
    await requestCode(email).expect(200);
    const res: Response = await loginWithCode(
      emailedCode(testApp.mailbox.last(email)),
      email,
    ).expect(200);
    return res.body;
  };

  const profile = {
    firstName: 'Elena',
    lastName: 'Voluntar',
    phone: '+40720000001',
    birthday: '2000-01-01T00:00:00.000Z',
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
    await testApp.flushRedis();
    await truncate(testApp.dataSource, [
      'auth_identity',
      'user',
      'organization',
    ]);
    await testApp.dataSource.query(`DELETE FROM notifications_settings`);
  });

  it('new email → code → login (this is the sign-up) → no profile yet → create profile', async () => {
    const requested = await requestCode('  Elena@Example.RO ').expect(200);
    expect(requested.body).toEqual({ maskedEmail: 'e•••@example.ro' });

    const email = testApp.mailbox.last(EMAIL);
    expect(email.subject).toContain('Codul tău VIC');
    const identity = await testApp.app
      .get(AuthIdentityFacade)
      .findIdentity({ realm: AuthRealm.MOBILE, email: EMAIL });
    expect(identity.status).toBe(AuthIdentityStatus.PENDING);

    const session = await loginWithCode(emailedCode(email)).expect(200);
    const { accessToken, refreshToken } = session.body;
    expect(refreshToken).toEqual(expect.any(String));

    const after = await testApp.app
      .get(AuthIdentityFacade)
      .findIdentity({ realm: AuthRealm.MOBILE, email: EMAIL });
    expect(after.status).toBe(AuthIdentityStatus.ACTIVE);
    expect(after.emailVerifiedAt).toBeInstanceOf(Date);

    const noProfile = await http
      .get('/mobile/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
    expect(noProfile.body.code_error).toBe('USER_001');

    await http
      .post('/mobile/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...profile, email: 'someone-else@example.ro' })
      .expect(201);

    const created = await http
      .get('/mobile/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    // The profile takes the confirmed login email, never the one in the body.
    expect(created.body.email).toBe(EMAIL);

    await http
      .post('/mobile/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...profile, phone: '+40720000002' })
      .expect(400);
  });

  it('a wrong code counts; the fifth wrong one ends the code (AUTH_006); a new code works', async () => {
    await requestCode().expect(200);
    const code = emailedCode(testApp.mailbox.last(EMAIL));
    const wrong = code === '000000' ? '111111' : '000000';

    for (let attempt = 1; attempt <= 4; attempt++) {
      expect((await loginWithCode(wrong).expect(400)).body.code_error).toBe(
        'AUTH_005',
      );
    }
    expect((await loginWithCode(wrong).expect(400)).body.code_error).toBe(
      'AUTH_006',
    );
    // the right code no longer works either
    await loginWithCode(code).expect(400);

    await loggedIn();
  });

  it('a code works once, and an expired code is AUTH_005', async () => {
    await requestCode().expect(200);
    const code = emailedCode(testApp.mailbox.last(EMAIL));
    await loginWithCode(code).expect(200);
    expect((await loginWithCode(code).expect(400)).body.code_error).toBe(
      'AUTH_005',
    );

    await testApp.flushRedis();
    await requestCode().expect(200);
    await testApp.dataSource.query(
      `UPDATE auth_token SET expires_at = now() - interval '1 second'`,
    );
    const expired = await loginWithCode(
      emailedCode(testApp.mailbox.last(EMAIL)),
    ).expect(400);
    expect(expired.body.code_error).toBe('AUTH_005');
  });

  it('one code a minute: a second request inside the minute is AUTH_010', async () => {
    await requestCode().expect(200);
    const again = await requestCode().expect(429);
    expect(again.body.code_error).toBe('AUTH_010');
  });

  it('the code for one volunteer fails for another, even with the same digits', async () => {
    const OTHER = 'bogdan@example.ro';
    await requestCode().expect(200);
    await requestCode(OTHER).expect(200);
    const elenaCode = emailedCode(testApp.mailbox.last(EMAIL));
    const bogdanCode = emailedCode(testApp.mailbox.last(OTHER));

    const wrongPerson = await loginWithCode(elenaCode, OTHER);
    // Two codes can collide by chance (1 in a million); then this one is Bogdan's own and works.
    if (bogdanCode !== elenaCode) {
      expect(wrongPerson.status).toBe(400);
      expect(wrongPerson.body.code_error).toBe('AUTH_005');
    }
    await loginWithCode(elenaCode).expect(200);
  });

  it('a disabled login cannot ask for a code: AUTH_004', async () => {
    await loggedIn();
    const facade = testApp.app.get(AuthIdentityFacade);
    const identity = await facade.findIdentity({
      realm: AuthRealm.MOBILE,
      email: EMAIL,
    });
    await facade.updateIdentity(identity.id, {
      status: AuthIdentityStatus.DISABLED,
    });

    await testApp.flushRedis();
    const res = await requestCode().expect(403);
    expect(res.body.code_error).toBe('AUTH_004');
  });

  it('the password routes are gone', async () => {
    await http
      .post('/mobile/auth/login')
      .send({ email: EMAIL, password: 'Volunteer#2026' })
      .expect(404);
    await http.post('/mobile/auth/register').expect(404);
    await http.post('/mobile/auth/forgot-password').expect(404);
    await http.post('/mobile/auth/reset-password').expect(404);
    await http.patch('/mobile/auth/change-password').expect(404);
  });

  it('a profile-less volunteer cannot delete anyone: USER_001', async () => {
    await testApp.dataSource.query(
      `INSERT INTO "user" (type, cognito_id, name, email, phone, first_name, last_name)
       VALUES ('regular', 'someone', 'Other', 'other@example.ro', '+40799999999', 'Other', 'Person')`,
    );
    const { accessToken } = await loggedIn();
    const auth = { Authorization: `Bearer ${accessToken}` };

    expect(
      (await http.delete('/mobile/user').set(auth).expect(404)).body.code_error,
    ).toBe('USER_001');
    const [{ count }] = await testApp.dataSource.query(
      `SELECT count(*)::int AS count FROM "user" WHERE deleted_on IS NULL`,
    );
    expect(count).toBe(1);
  });

  it('logout ends the session', async () => {
    const { refreshToken } = await loggedIn();

    await http.post('/mobile/auth/logout').send({ refreshToken }).expect(204);
    await http.post('/mobile/auth/refresh').send({ refreshToken }).expect(401);
  });

  it('delete account removes the login and its sessions; the email can sign up again', async () => {
    const { accessToken, refreshToken } = await loggedIn();
    const auth = { Authorization: `Bearer ${accessToken}` };
    await http
      .post('/mobile/user')
      .set(auth)
      .send({ ...profile, email: EMAIL })
      .expect(201);

    await http.delete('/mobile/user').set(auth).expect(200);

    await expect(
      testApp.app
        .get(AuthIdentityFacade)
        .findIdentity({ realm: AuthRealm.MOBILE, email: EMAIL }),
    ).resolves.toBeNull();
    await http.post('/mobile/auth/refresh').send({ refreshToken }).expect(401);
    await loggedIn();
  });

  it('refresh through the body: rotation, the 10 s window for a crossing request, then a replay ends the session', async () => {
    const { refreshToken } = await loggedIn();
    const rotated = (
      await http.post('/mobile/auth/refresh').send({ refreshToken }).expect(200)
    ).body;
    expect(rotated.refreshToken).not.toBe(refreshToken);

    await testApp.dataSource.query(
      `UPDATE refresh_token SET rotated_at = now() - interval '3 seconds'`,
    );
    await http.post('/mobile/auth/refresh').send({ refreshToken }).expect(200);

    await testApp.dataSource.query(
      `UPDATE refresh_token SET rotated_at = now() - interval '11 seconds'`,
    );
    const replay = await http
      .post('/mobile/auth/refresh')
      .send({ refreshToken })
      .expect(401);
    expect(replay.body.code_error).toBe('AUTH_008');
    await http
      .post('/mobile/auth/refresh')
      .send({ refreshToken: rotated.refreshToken })
      .expect(401);
  });
});
