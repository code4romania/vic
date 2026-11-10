import {
  AuthIdentityStatus,
  AuthProvider,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { MigrateIdentitiesUseCase } from 'src/usecases/auth/migrate-identities.usecase';
import { TransitionMailService } from 'src/modules/auth/services/transition-mail.service';
import { Test } from 'supertest';
import { socialToken, SocialFixture } from './utils/fake-social';
import { api, emailedCode, refreshCookie } from './utils/http';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// Google and Apple sign-in in the app and on the web (#512), with fixture tokens instead of the providers.
describe('Social sign-in (e2e)', () => {
  let testApp: TestApp;
  let http: ReturnType<typeof api>;
  let facade: AuthIdentityFacade;

  const social = (provider: AuthProvider, fixture: SocialFixture): Test =>
    http
      .post('/mobile/auth/social')
      .send({ provider, token: socialToken(fixture) });

  const profile = (accessToken: string): Test =>
    http
      .get('/mobile/user/profile')
      .set('Authorization', `Bearer ${accessToken}`);

  const links = (): Promise<
    { provider: string; subject: string; identity_id: string }[]
  > =>
    testApp.dataSource.query(
      `SELECT provider, subject, identity_id FROM auth_identity_provider ORDER BY provider`,
    );

  // A volunteer as the cutover import leaves them: a profile from before, a pending login.
  const legacyVolunteer = async (
    email: string,
    cognitoId: string,
  ): Promise<string> => {
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, cognito_id, name, email, phone, first_name, last_name)
       VALUES ('regular', $1, 'Mara Veche', $2, '+40720000009', 'Mara', 'Veche') RETURNING id`,
      [cognitoId, email],
    );
    return user.id;
  };

  beforeAll(async () => {
    testApp = await createTestApp();
    http = api(testApp.app);
    facade = testApp.app.get(AuthIdentityFacade);
  });

  afterAll(async () => {
    // auth:migrate held transition emails in the test Redis; drop them.
    await testApp?.app
      .get(TransitionMailService)
      .drop()
      .catch(() => undefined);
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

  it.each([AuthProvider.GOOGLE, AuthProvider.APPLE])(
    '%s: a new email gets a login and a provider link; a second sign-in reuses it',
    async (provider) => {
      const fixture = { sub: `${provider}-sub-1`, email: 'Nou@Example.ro' };

      const first = await social(provider, fixture).expect(200);
      expect(first.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      );

      const identity = await facade.findIdentity({
        realm: AuthRealm.MOBILE,
        email: 'nou@example.ro',
      });
      expect(identity).toMatchObject({
        status: AuthIdentityStatus.ACTIVE,
      });
      expect(identity.emailVerifiedAt).toBeInstanceOf(Date);
      expect(await links()).toEqual([
        { provider, subject: `${provider}-sub-1`, identity_id: identity.id },
      ]);

      // Same subject, even with another email at the provider: the same login, no second link.
      await social(provider, {
        ...fixture,
        email: 'changed@example.ro',
      }).expect(200);
      expect(await links()).toHaveLength(1);
      const [{ count }] = await testApp.dataSource.query(
        `SELECT count(*)::int AS count FROM auth_identity`,
      );
      expect(count).toBe(1);

      // The same login also works with the emailed code (VIC 2.0, #514: no passwords).
      await http
        .post('/mobile/auth/login/request')
        .send({ email: 'nou@example.ro' })
        .expect(200);
      await http
        .post('/mobile/auth/login/code')
        .send({
          email: 'nou@example.ro',
          code: emailedCode(testApp.mailbox.last('nou@example.ro')),
        })
        .expect(200);
      const [{ logins }] = await testApp.dataSource.query(
        `SELECT count(*)::int AS logins FROM auth_identity`,
      );
      expect(logins).toBe(1);
    },
  );

  it('a wrong audience, an expired token, an unverified email or no email is 401 AUTH_013', async () => {
    const bad: SocialFixture[] = [
      { sub: 's', email: 'a@x.ro', aud: 'another-app' },
      { sub: 's', email: 'a@x.ro', exp: Math.floor(Date.now() / 1000) - 10 },
      { sub: 's', email: 'a@x.ro', email_verified: false },
      { sub: 's' },
    ];
    for (const fixture of bad) {
      const res = await social(AuthProvider.GOOGLE, fixture).expect(401);
      expect(res.body.code_error).toBe('AUTH_013');
    }
    const garbage = await http
      .post('/mobile/auth/social')
      .send({ provider: AuthProvider.APPLE, token: 'not-a-token' })
      .expect(401);
    expect(garbage.body.code_error).toBe('AUTH_013');
    expect(await links()).toHaveLength(0);
  });

  it('a migrated volunteer in pending lands on the old profile and is active afterwards (R4)', async () => {
    const userId = await legacyVolunteer(
      'mara@example.ro',
      'f81c-plain-cognito-user',
    );
    await testApp.app.get(MigrateIdentitiesUseCase).execute();

    const res = await social(AuthProvider.GOOGLE, {
      sub: 'google-mara',
      email: 'mara@example.ro',
    }).expect(200);

    const me = await profile(res.body.accessToken).expect(200);
    expect(me.body).toMatchObject({
      id: userId,
      firstName: 'Mara',
      email: 'mara@example.ro',
    });
    const identity = await facade.findIdentity({ userId });
    expect(identity.status).toBe(AuthIdentityStatus.ACTIVE);
  });

  it('one imported from a google_ Cognito username is found by its provider link, even with another email (R35, R4)', async () => {
    const userId = await legacyVolunteer(
      'old-gmail@example.ro',
      'google_10769150350006150715113',
    );
    await testApp.app.get(MigrateIdentitiesUseCase).execute();
    const [link] = await links();
    expect(link).toMatchObject({
      provider: 'google',
      subject: '10769150350006150715113',
    });

    const res = await social(AuthProvider.GOOGLE, {
      sub: '10769150350006150715113',
      email: 'new-gmail@example.ro',
    }).expect(200);

    expect((await profile(res.body.accessToken).expect(200)).body.id).toBe(
      userId,
    );
    expect((await facade.findIdentity({ userId })).status).toBe(
      AuthIdentityStatus.ACTIVE,
    );
    const [{ count }] = await testApp.dataSource.query(
      `SELECT count(*)::int AS count FROM auth_identity`,
    );
    expect(count).toBe(1);
  });

  it('a disabled login is refused with 403 AUTH_004', async () => {
    await social(AuthProvider.APPLE, {
      sub: 'apple-1',
      email: 'off@example.ro',
    }).expect(200);
    const identity = await facade.findIdentity({
      realm: AuthRealm.MOBILE,
      email: 'off@example.ro',
    });
    await facade.updateIdentity(identity.id, {
      status: AuthIdentityStatus.DISABLED,
    });

    const res = await social(AuthProvider.APPLE, {
      sub: 'apple-1',
      email: 'off@example.ro',
    }).expect(403);
    expect(res.body.code_error).toBe('AUTH_004');
  });

  it('Facebook is no longer accepted (#512): 400 before any lookup', async () => {
    await http
      .post('/mobile/auth/social')
      .send({
        provider: AuthProvider.FACEBOOK,
        token: socialToken({ sub: 'fb-1', email: 'fb@example.ro' }),
      })
      .expect(400);
    expect(await links()).toHaveLength(0);
  });

  describe('on the web (#512)', () => {
    const webSocial = (provider: AuthProvider, fixture: SocialFixture): Test =>
      http
        .post('/auth/web/social')
        .send({ provider, token: socialToken(fixture) });

    // An NGO admin as the sign-up or the cutover leaves them; one NGO each, with its own phone numbers.
    let admins = 0;
    const admin = async (
      email: string,
      status: AuthIdentityStatus,
      emailVerifiedAt: Date | null = new Date(),
    ): Promise<string> => {
      const [organization] = await testApp.dataSource.query(
        `INSERT INTO organization (name, email, phone, status, validated_at)
         VALUES ('Asociatia ' || $1, $1, $2, 'active', now()) RETURNING id`,
        [email, `+4070000000${admins}`],
      );
      const [user] = await testApp.dataSource.query(
        `INSERT INTO "user" (type, name, email, phone, organization_id)
         VALUES ('admin', 'Ana Admin', $1, $3, $2) RETURNING id`,
        [email, organization.id, `+4071111111${admins++}`],
      );
      await facade.createIdentity({
        realm: AuthRealm.WEB,
        email,
        status,
        userId: user.id,
        emailVerifiedAt,
      });
      return user.id;
    };

    it.each([AuthProvider.GOOGLE, AuthProvider.APPLE])(
      '%s: an admin is signed in by verified email, with the refresh cookie and no provider link',
      async (provider) => {
        const userId = await admin('ana@ong.ro', AuthIdentityStatus.ACTIVE);

        const res = await webSocial(provider, {
          sub: `${provider}-admin`,
          email: 'Ana@Ong.ro',
        }).expect(200);

        expect(res.body).toMatchObject({
          accessToken: expect.any(String),
          user: { id: userId, email: 'ana@ong.ro', superAdmin: false },
        });
        expect(res.body.refreshToken).toBeUndefined();
        expect(refreshCookie(res)).toMatch(/vic_refresh=.+HttpOnly/);
        await http
          .get('/auth/web/me')
          .set('Authorization', `Bearer ${res.body.accessToken}`)
          .expect(200);
        expect(await links()).toHaveLength(0);
      },
    );

    it('an invited admin who never used the invite becomes active', async () => {
      await admin('nou@ong.ro', AuthIdentityStatus.PENDING);

      await webSocial(AuthProvider.GOOGLE, {
        sub: 'g-new-admin',
        email: 'nou@ong.ro',
      }).expect(200);

      expect(
        (
          await facade.findIdentity({
            realm: AuthRealm.WEB,
            email: 'nou@ong.ro',
          })
        ).status,
      ).toBe(AuthIdentityStatus.ACTIVE);
    });

    it('never creates a login: an unknown email is 404 AUTH_014, a volunteer is 409 AUTH_012', async () => {
      const unknown = await webSocial(AuthProvider.GOOGLE, {
        sub: 'g-x',
        email: 'nimeni@example.ro',
      }).expect(404);
      expect(unknown.body.code_error).toBe('AUTH_014');

      await social(AuthProvider.GOOGLE, {
        sub: 'g-vol',
        email: 'vol@example.ro',
      }).expect(200);
      const volunteer = await webSocial(AuthProvider.GOOGLE, {
        sub: 'g-vol',
        email: 'vol@example.ro',
      }).expect(409);
      expect(volunteer.body.code_error).toBe('AUTH_012');

      const [{ count }] = await testApp.dataSource.query(
        `SELECT count(*)::int AS count FROM auth_identity WHERE realm = 'web'`,
      );
      expect(count).toBe(0);
    });

    it('refuses a disabled admin (AUTH_004), an unconfirmed NGO sign-up (AUTH_003) and a bad token (AUTH_013)', async () => {
      await admin('off@ong.ro', AuthIdentityStatus.DISABLED);
      expect(
        (
          await webSocial(AuthProvider.APPLE, {
            sub: 'a-off',
            email: 'off@ong.ro',
          }).expect(403)
        ).body.code_error,
      ).toBe('AUTH_004');

      await admin('new@ong.ro', AuthIdentityStatus.PENDING, null);
      expect(
        (
          await webSocial(AuthProvider.GOOGLE, {
            sub: 'g-new',
            email: 'new@ong.ro',
          }).expect(403)
        ).body.code_error,
      ).toBe('AUTH_003');

      expect(
        (
          await webSocial(AuthProvider.GOOGLE, {
            sub: 'g-new',
            email: 'new@ong.ro',
            email_verified: false,
          }).expect(401)
        ).body.code_error,
      ).toBe('AUTH_013');
    });
  });
});
