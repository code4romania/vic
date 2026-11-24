import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserLanguage1794460000000 } from 'src/migrations/1794460000000-UserLanguage';
import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import ApproveHoursEvent from 'src/modules/notifications/events/volunteer-hours/approve-hours.event';
import { PushTokensRepository } from 'src/modules/notifications/repositories/push-tokens.repository';
import { Test } from 'supertest';
import { api, asWeb, emailedCode } from './utils/http';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// Romanian and English: the language lives on the account, the apps report or set it, and the emails
// and push notifications follow it. People who used VIC before the switch existed stay on Romanian.
describe('Language (e2e)', () => {
  let testApp: TestApp;
  let http: ReturnType<typeof api>;
  let facade: AuthIdentityFacade;

  const profile = {
    firstName: 'Elena',
    lastName: 'Voluntar',
    birthday: '2000-01-01T00:00:00.000Z',
  };

  const languageOf = async (email: string, type: string): Promise<string> =>
    (
      await testApp.dataSource.query(
        `SELECT language FROM "user" WHERE lower(email) = lower($1) AND type = $2`,
        [email, type],
      )
    )[0]?.language;

  const requestCode = (email: string, language?: string): Test => {
    const req = http.post('/mobile/auth/login/request');
    if (language) req.set('Accept-Language', language);
    return req.send({ email });
  };

  // A volunteer who signs up from an app in the given language; returns the access token.
  const signUp = async (email: string, language?: string): Promise<string> => {
    await testApp.flushRedis();
    await requestCode(email, language).expect(200);
    const login = await http
      .post('/mobile/auth/login/code')
      .send({ email, code: emailedCode(testApp.mailbox.last(email)) })
      .expect(200);
    const create = http
      .post('/mobile/user')
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    if (language) create.set('Accept-Language', language);
    await create.send(profile).expect(201);
    return login.body.accessToken;
  };

  // An admin with a login that has (or has not) been used, in an active organization.
  const seedAdmin = async (
    email: string,
    options: { language?: string | null; active?: boolean } = {},
  ): Promise<string> => {
    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ($1, $2, '+40700000001', 'active', now()) RETURNING id`,
      [`Org ${email}`, `org-${email}`],
    );
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id, language)
       VALUES ('admin', 'Admin', $1, '+40711111111', $2, $3) RETURNING id`,
      [email, organization.id, options.language ?? null],
    );
    await facade.createIdentity({
      realm: AuthRealm.WEB,
      email,
      status:
        options.active === false
          ? AuthIdentityStatus.PENDING
          : AuthIdentityStatus.ACTIVE,
      userId: user.id,
      emailVerifiedAt: new Date(),
    });
    return user.id;
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
    testApp.mailbox.clear();
    await testApp.flushRedis();
    await truncate(testApp.dataSource, [
      'auth_identity',
      'user',
      'organization',
    ]);
    await testApp.dataSource.query(`DELETE FROM notifications_settings`);
  });

  describe('the migration', () => {
    // The column is dropped and the migration run again over seeded rows, the way production runs it.
    it('marks the people who already used VIC as Romanian and leaves the others undecided', async () => {
      const runner = testApp.dataSource.createQueryRunner();
      const migration = new UserLanguage1794460000000();
      await migration.down(runner);
      try {
        const user = async (
          email: string,
          extra: { cognito?: string; hasAccount?: boolean } = {},
        ): Promise<string> =>
          (
            await runner.query(
              `INSERT INTO "user" (type, name, first_name, last_name, email, cognito_id, has_account)
               VALUES ('regular', 'V', 'V', 'V', $1, $2, $3) RETURNING id`,
              [email, extra.cognito ?? null, extra.hasAccount ?? true],
            )
          )[0].id;
        const identity = (
          email: string,
          userId: string,
          status: string,
        ): Promise<unknown> =>
          runner.query(
            `INSERT INTO auth_identity (realm, email, status, user_id) VALUES ('mobile', $1, $2, $3)`,
            [email, status, userId],
          );

        // from before the new login, not logged in since
        await user('legacy@example.ro', { cognito: 'cog-1' });
        // signed up with the new login and used it
        await identity(
          'active@example.ro',
          await user('active@example.ro'),
          'active',
        );
        // a login that was created but never used (an invited admin, a volunteer who never entered the code)
        await identity(
          'pending@example.ro',
          await user('pending@example.ro'),
          'pending',
        );
        // added by an NGO, no account
        await user('candidate@example.ro', { hasAccount: false });
      } finally {
        await migration.up(runner);
        await runner.release();
      }

      await expect(languageOf('legacy@example.ro', 'regular')).resolves.toBe(
        'ro',
      );
      await expect(languageOf('active@example.ro', 'regular')).resolves.toBe(
        'ro',
      );
      await expect(
        languageOf('pending@example.ro', 'regular'),
      ).resolves.toBeNull();
      await expect(
        languageOf('candidate@example.ro', 'regular'),
      ).resolves.toBeNull();

      // only the two languages fit in the column
      await expect(
        testApp.dataSource.query(
          `UPDATE "user" SET language = 'hu' WHERE email = 'legacy@example.ro'`,
        ),
      ).rejects.toThrow(/user_language_check/);
    });
  });

  describe('a volunteer', () => {
    it('who signs up from an app in English gets the code in English and an English account', async () => {
      const accessToken = await signUp('en@example.ro', 'en');

      const code = testApp.mailbox.to('en@example.ro')[0];
      expect(code.subject).toMatch(/^Your VIC code: \d{6}$/);
      expect(code.context).toMatchObject({
        title: 'Your login code',
        isEnglish: true,
        english: null,
      });

      const { body } = await http
        .get('/mobile/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(body.language).toBe('en');
    });

    it('from an app version that sends no language gets both languages and an undecided account', async () => {
      const accessToken = await signUp('old@example.ro');

      const code = testApp.mailbox.to('old@example.ro')[0];
      expect(code.subject).toMatch(
        /^Codul tău VIC: \d{6} \/ Your VIC code: \d{6}$/,
      );
      expect(code.context).toMatchObject({
        title: 'Codul de autentificare',
        isEnglish: false,
        english: { title: 'Your login code' },
      });

      const { body } = await http
        .get('/mobile/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(body.language).toBeNull();
    });

    it("the phone's own Accept-Language is not the app's language", async () => {
      await testApp.flushRedis();
      await requestCode('phone@example.ro', 'en-US,en;q=0.9').expect(200);

      expect(testApp.mailbox.last('phone@example.ro').context.english).toEqual(
        expect.objectContaining({ title: 'Your login code' }),
      );
    });

    it('the detected language only fills an undecided account; the chosen one replaces it', async () => {
      const accessToken = await signUp('ana@example.ro');
      const setLanguage = (body: object): Test =>
        http
          .patch('/mobile/user/language')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body);

      // the app reports what it detected: kept, the account had none
      await expect(
        setLanguage({ language: 'en' }).expect(200),
      ).resolves.toMatchObject({ body: { language: 'en' } });
      // another phone, in Romanian, reports its own: the account keeps English and says so
      await expect(
        setLanguage({ language: 'ro' }).expect(200),
      ).resolves.toMatchObject({ body: { language: 'en' } });
      // the volunteer picks Romanian in Settings
      await expect(
        setLanguage({ language: 'ro', explicit: true }).expect(200),
      ).resolves.toMatchObject({ body: { language: 'ro' } });
      await expect(languageOf('ana@example.ro', 'regular')).resolves.toBe('ro');

      await setLanguage({ language: 'hu' }).expect(400);
      await setLanguage({}).expect(400);
    });

    it('who already had an account keeps Romanian emails, whatever language the login screen is in', async () => {
      await signUp('veche@example.ro', 'ro');
      testApp.mailbox.clear();
      await testApp.flushRedis();

      await requestCode('veche@example.ro', 'en').expect(200);

      const code = testApp.mailbox.last('veche@example.ro');
      expect(code.subject).toMatch(/^Codul tău VIC: \d{6}$/);
      expect(code.context).toMatchObject({ isEnglish: false, english: null });
    });

    it('gets the notification emails in their own language', async () => {
      await signUp('en@example.ro', 'en');
      await signUp('ro@example.ro', 'ro');
      await signUp('none@example.ro');
      testApp.mailbox.clear();

      const emitter = testApp.app.get(EventEmitter2);
      for (const email of [
        'en@example.ro',
        'ro@example.ro',
        'none@example.ro',
      ]) {
        await emitter.emitAsync(
          EVENTS.VOLUNTEER_HOURS.APPROVE,
          new ApproveHoursEvent(
            'org-id',
            'user-id',
            'QA ONG',
            false,
            true,
            email,
            'log-id',
            2,
            new Date('2026-11-18T10:00:00.000Z'),
          ),
        );
      }

      expect(testApp.mailbox.last('en@example.ro')).toMatchObject({
        subject: 'Your volunteering hours at QA ONG were approved',
        context: {
          subtitle:
            '2 hours of volunteering on 18/11/2026 were approved. You can find them in the VIC app.',
          isEnglish: true,
          english: null,
        },
      });
      expect(testApp.mailbox.last('ro@example.ro')).toMatchObject({
        subject: 'Orele tale de voluntariat la QA ONG au fost aprobate',
        context: { isEnglish: false, english: null },
      });
      expect(testApp.mailbox.last('none@example.ro')).toMatchObject({
        subject:
          'Orele tale de voluntariat la QA ONG au fost aprobate / Your volunteering hours at QA ONG were approved',
        context: {
          isEnglish: false,
          english: {
            title: 'Your volunteering hours at QA ONG were approved',
          },
        },
      });
    });

    it('has each phone listed with their language, for the push notifications', async () => {
      await signUp('en@example.ro', 'en');
      await signUp('none@example.ro');
      const ids: { id: string; email: string }[] =
        await testApp.dataSource.query(
          `SELECT id, email FROM "user" WHERE type = 'regular' ORDER BY email`,
        );
      for (const { id, email } of ids) {
        await testApp.dataSource.query(
          `INSERT INTO push_tokens (token, user_id) VALUES ($1, $2)`,
          [`ExponentPushToken[${email}]`, id],
        );
      }

      const devices = await testApp.app
        .get(PushTokensRepository, { strict: false })
        .findByUserIdsWithLanguage(ids.map(({ id }) => id));

      expect(devices).toEqual(
        expect.arrayContaining([
          { token: 'ExponentPushToken[en@example.ro]', language: 'en' },
          { token: 'ExponentPushToken[none@example.ro]', language: null },
        ]),
      );
      expect(devices).toHaveLength(2);
    });
  });

  describe('an admin', () => {
    it('who used VIC before stays on Romanian until they choose English', async () => {
      await seedAdmin('veche@ong.ro', { language: 'ro' });

      // the login page is in English (the browser's language), the account is Romanian
      await testApp.flushRedis();
      await http
        .post('/auth/web/login/request')
        .set('Accept-Language', 'en')
        .send({ email: 'veche@ong.ro' })
        .expect(204);
      expect(testApp.mailbox.last('veche@ong.ro')).toMatchObject({
        subject: 'Linkul tău de autentificare VIC',
        context: { isEnglish: false, english: null },
      });

      const { auth } = await asWeb(testApp, http, 'veche@ong.ro');
      const me = await http.get('/auth/web/me').set(auth).expect(200);
      expect(me.body.language).toBe('ro');

      // the web app reports the browser's language: the account keeps Romanian
      const detected = await http
        .patch('/auth/web/language')
        .set(auth)
        .send({ language: 'en' })
        .expect(200);
      expect(detected.body).toEqual({ language: 'ro' });

      // the admin picks English in the menu
      const chosen = await http
        .patch('/auth/web/language')
        .set(auth)
        .send({ language: 'en', explicit: true })
        .expect(200);
      expect(chosen.body).toEqual({ language: 'en' });
      expect(
        (await http.get('/auth/web/me').set(auth).expect(200)).body.language,
      ).toBe('en');

      // from now on the emails are in English
      testApp.mailbox.clear();
      await testApp.flushRedis();
      await http
        .post('/auth/web/login/request')
        .send({ email: 'veche@ong.ro' })
        .expect(204);
      expect(testApp.mailbox.last('veche@ong.ro')).toMatchObject({
        subject: 'Your VIC login link',
        context: {
          cta: { label: 'Log in to VIC' },
          isEnglish: true,
          english: null,
        },
      });
    });

    it('with an undecided account gets the language of the first browser they log in from', async () => {
      await seedAdmin('noua@ong.ro');
      const { auth } = await asWeb(testApp, http, 'noua@ong.ro');
      // no language anywhere: the link came in both languages, with the button in both
      expect(testApp.mailbox.last('noua@ong.ro')).toMatchObject({
        subject: 'Linkul tău de autentificare VIC / Your VIC login link',
        context: { cta: { label: 'Intră în VIC / Log in to VIC' } },
      });
      expect(
        (await http.get('/auth/web/me').set(auth).expect(200)).body.language,
      ).toBeNull();

      const detected = await http
        .patch('/auth/web/language')
        .set(auth)
        .send({ language: 'en' })
        .expect(200);

      expect(detected.body).toEqual({ language: 'en' });
      await expect(languageOf('noua@ong.ro', 'admin')).resolves.toBe('en');
    });

    it('cannot set a language without logging in', async () => {
      await http
        .patch('/auth/web/language')
        .send({ language: 'en', explicit: true })
        .expect(401);
      await http
        .patch('/mobile/user/language')
        .send({ language: 'en', explicit: true })
        .expect(401);
    });
  });

  describe('a new organization', () => {
    it('registered from the page in English gets an English admin and English emails', async () => {
      let req = http
        .post('/organizations/register')
        .set('Accept-Language', 'en');
      for (const [key, value] of Object.entries({
        name: 'New Association',
        email: 'contact@new.ro',
        phone: '+40700000100',
        taxId: 'RO12345674',
        firstName: 'Ana',
        lastName: 'Popescu',
        adminEmail: 'ana@new.ro',
        adminPhone: '+40711111100',
        acceptedTerms: 'true',
        declaresRegisteredNgo: 'true',
        declaresRepresentative: 'true',
      })) {
        req = req.field(key, value);
      }
      await req.expect(201);

      await expect(languageOf('ana@new.ro', 'admin')).resolves.toBe('en');
      expect(testApp.mailbox.last('ana@new.ro')).toMatchObject({
        subject: 'Activate New Association on VIC',
        context: {
          cta: { label: 'Confirm the address' },
          isEnglish: true,
          english: null,
        },
      });

      // asked again from a page in Romanian: the account's language still decides
      testApp.mailbox.clear();
      await testApp.flushRedis();
      await http
        .post('/auth/web/resend-verification')
        .set('Accept-Language', 'ro')
        .send({ email: 'ana@new.ro' })
        .expect(200);
      expect(testApp.mailbox.last('ana@new.ro').subject).toBe(
        'Activate New Association on VIC',
      );
    });
  });
});
