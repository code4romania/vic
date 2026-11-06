import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { PasswordService } from 'src/modules/auth/services/password.service';
import { api, linkSecret } from './utils/http';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// The Team page: an NGO's admins add, invite, disable and enable each other.
describe('Team (e2e)', () => {
  let testApp: TestApp;
  let http: ReturnType<typeof api>;
  let facade: AuthIdentityFacade;
  let organizationId: string;
  let otherOrganizationId: string;
  let me: { userId: string; identity: IAuthIdentityModel; token: string };
  const PASSWORD = 'Admin#2026x';

  const auth = (token = me.token): Record<string, string> => ({
    Authorization: `Bearer ${token}`,
  });

  const insertAdmin = async (
    email: string,
    orgId = organizationId,
    login?: { status: AuthIdentityStatus; withPassword: boolean },
  ): Promise<{ userId: string; identity?: IAuthIdentityModel }> => {
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', $1, $1, '+40700000000', $2) RETURNING id`,
      [email, orgId],
    );
    if (!login) return { userId: user.id };
    const identity = await facade.createIdentity({
      realm: AuthRealm.WEB,
      email,
      status: login.status,
      userId: user.id,
      emailVerifiedAt: new Date(),
      passwordHash: login.withPassword
        ? await testApp.app.get(PasswordService).hash(PASSWORD)
        : undefined,
    });
    return { userId: user.id, identity };
  };

  const team = async (): Promise<
    Record<string, { status: string; [key: string]: unknown }>
  > => {
    const res = await http.get('/organization/team').set(auth()).expect(200);
    return Object.fromEntries(
      res.body.map((member: { email: string }) => [member.email, member]),
    );
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
      'actions_archive',
    ]);
    const [org] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Asociatia Echipa', 'echipa@ong.ro', '+40700000010', 'active', now()) RETURNING id`,
    );
    organizationId = org.id;
    const [other] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Alt ONG', 'alt@ong.ro', '+40700000020', 'active', now()) RETURNING id`,
    );
    otherOrganizationId = other.id;
    const mine = await insertAdmin('eu@ong.ro', organizationId, {
      status: AuthIdentityStatus.ACTIVE,
      withPassword: true,
    });
    me = {
      userId: mine.userId,
      identity: mine.identity,
      token: await testApp.mintAccessToken(mine.identity, AuthRealm.WEB),
    };
    testApp.mailbox.clear();
  });

  it('lists the team with a status per admin', async () => {
    await insertAdmin('activ@ong.ro', organizationId, {
      status: AuthIdentityStatus.ACTIVE,
      withPassword: true,
    });
    await insertAdmin('dezactivat@ong.ro', organizationId, {
      status: AuthIdentityStatus.DISABLED,
      withPassword: true,
    });
    await insertAdmin('fara-parola@ong.ro', organizationId, {
      status: AuthIdentityStatus.PENDING_PASSWORD,
      withPassword: false,
    });
    await insertAdmin('neimportat@ong.ro');
    await insertAdmin('alt-ong@ong.ro', otherOrganizationId, {
      status: AuthIdentityStatus.ACTIVE,
      withPassword: true,
    });

    const members = await team();

    expect(Object.keys(members).sort()).toEqual(
      [
        'activ@ong.ro',
        'dezactivat@ong.ro',
        'eu@ong.ro',
        'fara-parola@ong.ro',
        'neimportat@ong.ro',
      ].sort(),
    );
    expect(members['activ@ong.ro'].status).toBe('active');
    expect(members['dezactivat@ong.ro'].status).toBe('disabled');
    expect(members['fara-parola@ong.ro'].status).toBe('invite_expired');
    expect(members['neimportat@ong.ro'].status).toBe('no_login');
  });

  it('add admin → invite email → token info names the NGO → set password → same organization', async () => {
    const added = await http
      .post('/organization/team')
      .set(auth())
      .send({
        firstName: 'Bogdan',
        lastName: 'Ionescu',
        email: 'Bogdan@ONG.ro',
        phone: '+40722222222',
      })
      .expect(201);
    expect(added.body).toEqual({ maskedEmail: 'b•••@ong.ro' });

    const invite = testApp.mailbox.last('bogdan@ong.ro');
    expect(invite.subject).toContain('Asociatia Echipa');
    const secret = linkSecret(invite);
    const info = await http.get(`/auth/token/${secret}`).expect(200);
    expect(info.body).toMatchObject({
      purpose: 'invite',
      realm: 'web',
      organizationName: 'Asociatia Echipa',
    });

    const member = (await team())['bogdan@ong.ro'];
    expect(member).toMatchObject({
      status: 'invite_sent',
      lastInviteSentBy: 'eu@ong.ro',
    });
    expect(member.inviteExpiresAt).toEqual(expect.any(String));

    const set = await http
      .post('/auth/set-password')
      .send({ token: secret, password: PASSWORD })
      .expect(200);
    expect(set.body.user).toMatchObject({
      email: 'bogdan@ong.ro',
      organizationId,
    });
    expect((await team())['bogdan@ong.ro'].status).toBe('active');

    const taken = await http
      .post('/organization/team')
      .set(auth())
      .send({
        firstName: 'Iar',
        lastName: 'Bogdan',
        email: 'bogdan@ong.ro',
        phone: '+40722222223',
      })
      .expect(409);
    expect(taken.body.code_error).toBe('AUTH_009');
  });

  it('send invite: 400 for an active member, 403 for another NGO, 429 on a second press, and the old link dies', async () => {
    const active = await insertAdmin('activ@ong.ro', organizationId, {
      status: AuthIdentityStatus.ACTIVE,
      withPassword: true,
    });
    const foreign = await insertAdmin('alt@alt.ro', otherOrganizationId, {
      status: AuthIdentityStatus.PENDING_PASSWORD,
      withPassword: false,
    });
    const pending = await insertAdmin('nou@ong.ro', organizationId, {
      status: AuthIdentityStatus.PENDING_PASSWORD,
      withPassword: false,
    });

    expect(
      (
        await http
          .post(`/organization/team/${active.userId}/invite`)
          .set(auth())
          .expect(400)
      ).body.code_error,
    ).toBe('ORG_009');
    expect(
      (
        await http
          .post(`/organization/team/${foreign.userId}/invite`)
          .set(auth())
          .expect(403)
      ).body.code_error,
    ).toBe('ORG_008');

    await http
      .post(`/organization/team/${pending.userId}/invite`)
      .set(auth())
      .expect(200);
    const first = linkSecret(testApp.mailbox.last('nou@ong.ro'));
    const again = await http
      .post(`/organization/team/${pending.userId}/invite`)
      .set(auth())
      .expect(429);
    expect(again.body.code_error).toBe('AUTH_010');

    // A fresh invite later (one per 10 minutes) replaces the first link.
    jest.useFakeTimers({
      doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'setInterval'],
      now: Date.now() + 11 * 60000,
    });
    try {
      await http
        .post(`/organization/team/${pending.userId}/invite`)
        .set(auth())
        .expect(200);
    } finally {
      jest.useRealTimers();
    }
    await http.get(`/auth/token/${first}`).expect(400);
  });

  it('an admin with no login yet gets one through Send invite', async () => {
    const legacy = await insertAdmin('neimportat@ong.ro');

    await http
      .post(`/organization/team/${legacy.userId}/invite`)
      .set(auth())
      .expect(200);

    expect(testApp.mailbox.last('neimportat@ong.ro')).toBeDefined();
    expect((await team())['neimportat@ong.ro'].status).toBe('invite_sent');
  });

  it('disable ends the colleague’s access at once; enable restores it without an email; both are recorded', async () => {
    const colleague = await insertAdmin('coleg@ong.ro', organizationId, {
      status: AuthIdentityStatus.ACTIVE,
      withPassword: true,
    });
    const login = await http
      .post('/auth/web/login')
      .send({ email: 'coleg@ong.ro', password: PASSWORD })
      .expect(200);
    const colleagueToken = login.body.accessToken;

    await http
      .patch(`/organization/team/${colleague.userId}/disable`)
      .set(auth())
      .expect(204);

    await http.get('/auth/web/me').set(auth(colleagueToken)).expect(401);
    expect(
      (
        await http
          .post('/auth/web/login')
          .send({ email: 'coleg@ong.ro', password: PASSWORD })
          .expect(403)
      ).body.code_error,
    ).toBe('AUTH_004');
    expect((await team())['coleg@ong.ro'].status).toBe('disabled');

    testApp.mailbox.clear();
    await http
      .patch(`/organization/team/${colleague.userId}/enable`)
      .set(auth())
      .expect(204);
    expect(testApp.mailbox.sent).toHaveLength(0);
    await http
      .post('/auth/web/login')
      .send({ email: 'coleg@ong.ro', password: PASSWORD })
      .expect(200);

    // trackEvent is fire-and-forget; give it a moment.
    await new Promise((resolve) => setTimeout(resolve, 200));
    const events = await testApp.dataSource.query(
      `SELECT event_name, event_data->>'adminName' AS admin FROM actions_archive ORDER BY created_on`,
    );
    expect(events).toEqual([
      { event_name: 'DISABLE_ADMIN', admin: 'coleg@ong.ro' },
      { event_name: 'ENABLE_ADMIN', admin: 'coleg@ong.ro' },
    ]);
  });

  it('enabling an admin who never set a password puts them back to waiting for one', async () => {
    const colleague = await insertAdmin('nou@ong.ro', organizationId, {
      status: AuthIdentityStatus.DISABLED,
      withPassword: false,
    });

    await http
      .patch(`/organization/team/${colleague.userId}/enable`)
      .set(auth())
      .expect(204);

    expect((await team())['nou@ong.ro'].status).toBe('invite_expired');
  });

  it('nobody can disable themselves (ORG_010) or a colleague of another NGO (ORG_008)', async () => {
    const foreign = await insertAdmin('alt@alt.ro', otherOrganizationId, {
      status: AuthIdentityStatus.ACTIVE,
      withPassword: true,
    });

    expect(
      (
        await http
          .patch(`/organization/team/${me.userId}/disable`)
          .set(auth())
          .expect(400)
      ).body.code_error,
    ).toBe('ORG_010');
    expect(
      (
        await http
          .patch(`/organization/team/${foreign.userId}/disable`)
          .set(auth())
          .expect(403)
      ).body.code_error,
    ).toBe('ORG_008');
  });
  // Layer 10 addition.
  it('an invite left 14 days shows invite_expired; resend on its link sends a working one from the same sender', async () => {
    await http
      .post('/organization/team')
      .set(auth())
      .send({
        firstName: 'Ion',
        lastName: 'Tarziu',
        email: 'ion@ong.ro',
        phone: '+40733333333',
      })
      .expect(201);
    const first = linkSecret(testApp.mailbox.last('ion@ong.ro'));
    expect((await team())['ion@ong.ro'].status).toBe('invite_sent');

    await testApp.dataSource.query(
      `UPDATE auth_token SET expires_at = now() - interval '1 second'`,
    );
    expect((await team())['ion@ong.ro'].status).toBe('invite_expired');
    await http.get(`/auth/token/${first}`).expect(400);

    await http.post(`/auth/token/${first}/resend`).expect(200);
    const fresh = linkSecret(testApp.mailbox.last('ion@ong.ro'));
    expect(fresh).not.toBe(first);
    const info = await http.get(`/auth/token/${fresh}`).expect(200);
    expect(info.body).toMatchObject({
      purpose: 'invite',
      organizationName: 'Asociatia Echipa',
    });
    expect((await team())['ion@ong.ro'].status).toBe('invite_sent');

    await http
      .post('/auth/set-password')
      .send({ token: fresh, password: PASSWORD })
      .expect(200);
    expect((await team())['ion@ong.ro'].status).toBe('active');
  });
});
