import { AuthIdentityStatus } from 'src/modules/auth/enums/auth.enums';
import { TransitionMailService } from 'src/modules/auth/services/transition-mail.service';
import { MigrateIdentitiesUseCase } from 'src/usecases/auth/migrate-identities.usecase';
import { api, asMobile, asWeb, linkSecret, refreshCookie } from './utils/http';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// The cutover import on seeded data, as `npm run auth:migrate` runs it: every admin and volunteer gets a
// pending login and one held transition email (admins: a 30-day login link; volunteers: "log in with your
// email in the app"); released, each kind of user gets in; a second run changes nothing.
describe('Identity migration (e2e)', () => {
  let testApp: TestApp;
  let http: ReturnType<typeof api>;
  let migrate: MigrateIdentitiesUseCase;
  let transition: TransitionMailService;

  const waitForEmails = async (count: number): Promise<void> => {
    for (let i = 0; i < 100 && testApp.mailbox.sent.length < count; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    expect(testApp.mailbox.sent).toHaveLength(count);
  };

  const seed = async (): Promise<Record<string, string>> => {
    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Asociatia Veche', 'org@veche.ro', '+40700000001', 'active', now()) RETURNING id`,
    );
    const admin = async (email: string, cognito: string): Promise<string> =>
      (
        await testApp.dataSource.query(
          `INSERT INTO "user" (type, cognito_id, name, email, phone, organization_id)
           VALUES ('admin', $1, 'Admin', $2, '+40711111111', $3) RETURNING id`,
          [cognito, email, organization.id],
        )
      )[0].id;
    const volunteer = async (
      email: string,
      cognito: string,
      deleted = false,
    ): Promise<string> =>
      (
        await testApp.dataSource.query(
          `INSERT INTO "user" (type, cognito_id, name, email, phone, first_name, last_name, deleted_on)
           VALUES ('regular', $1, 'Vol Unteer', $2, '+40722222222', 'Vol', 'Unteer', $3) RETURNING id`,
          [cognito, email, deleted ? new Date() : null],
        )
      )[0].id;

    return {
      organizationId: organization.id,
      admin: await admin('Admin@Veche.ro', 'cog-admin'),
      volunteer: await volunteer('vol@veche.ro', 'cog-vol'),
      bothAdmin: await admin('both@veche.ro', 'cog-both-a'),
      bothVolunteer: await volunteer('both@veche.ro', 'cog-both-v'),
      social: await volunteer('g@veche.ro', 'google_555'),
      deleted: await volunteer('gone@veche.ro', 'cog-gone', true),
    };
  };

  beforeAll(async () => {
    testApp = await createTestApp();
    http = api(testApp.app);
    migrate = testApp.app.get(MigrateIdentitiesUseCase);
    transition = testApp.app.get(TransitionMailService);
  });

  afterAll(async () => {
    await transition?.drop().catch(() => undefined);
    await testApp?.close();
  });

  beforeEach(async () => {
    await transition.drop();
    testApp.mailbox.clear();
    await testApp.flushRedis();
    await truncate(testApp.dataSource, [
      'auth_identity',
      'user',
      'organization',
    ]);
  });

  it('imports everyone pending, holds one email each, and a second run changes nothing', async () => {
    const users = await seed();

    const report = await migrate.execute();

    expect(report).toMatchObject({
      admins: 2,
      volunteers: 3,
      providerLinks: 1,
      skippedDeleted: 1,
      emailsQueued: 5,
    });
    const identities: { realm: string; status: string; user_id: string }[] =
      await testApp.dataSource.query(
        `SELECT realm, status, user_id FROM auth_identity`,
      );
    expect(identities).toHaveLength(5);
    expect(
      identities.every((i) => i.status === AuthIdentityStatus.PENDING),
    ).toBe(true);
    expect(identities.map((i) => i.user_id)).not.toContain(users.deleted);

    // Held: nothing reaches the mailbox before the release.
    const held = await transition.status();
    expect(held.paused).toBe(true);
    expect(held.held).toBe(5);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(testApp.mailbox.sent).toHaveLength(0);

    const again = await migrate.execute();
    expect(again).toMatchObject({
      admins: 0,
      volunteers: 0,
      unchanged: 5,
      emailsQueued: 0,
    });
    const [{ count }] = await testApp.dataSource.query(
      `SELECT count(*)::int AS count FROM auth_token`,
    );
    // Only the two admins get a link; volunteers log in with a code in the app (VIC 2.0, #514).
    expect(count).toBe(2);
  });

  it('released, the emails let an admin and a volunteer back in with their old data', async () => {
    const users = await seed();
    await migrate.execute();

    expect(await transition.release()).toBe(5);
    await waitForEmails(5);
    expect(testApp.mailbox.to('both@veche.ro')).toHaveLength(2);

    // Admin: the link opens a web session on the same organization.
    const adminSecret = linkSecret(testApp.mailbox.last('admin@veche.ro'));
    const info = await http.get(`/auth/token/${adminSecret}`).expect(200);
    expect(info.body).toMatchObject({
      type: 'invite',
      purpose: 'transition',
      realm: 'web',
    });
    const used = await http
      .post('/auth/login-link')
      .send({ token: adminSecret })
      .expect(200);
    expect(refreshCookie(used)).toBeDefined();
    const me = await http
      .get('/auth/web/me')
      .set('Authorization', `Bearer ${used.body.accessToken}`)
      .expect(200);
    expect(me.body).toMatchObject({
      id: users.admin,
      organizationId: users.organizationId,
    });
    // The link works once; afterwards the admin asks for a new one.
    await http
      .post('/auth/login-link')
      .send({ token: adminSecret })
      .expect(400);
    await asWeb(testApp, http, 'admin@veche.ro');

    // Volunteer: the email has no link; the app logs in with an emailed code and finds the old profile.
    expect(testApp.mailbox.last('vol@veche.ro').context.cta).toBeNull();
    const mobile = await asMobile(testApp, http, 'vol@veche.ro');
    const profile = await http
      .get('/mobile/user/profile')
      .set(mobile.auth)
      .expect(200);
    expect(profile.body).toMatchObject({
      id: users.volunteer,
      firstName: 'Vol',
    });
  });
});
