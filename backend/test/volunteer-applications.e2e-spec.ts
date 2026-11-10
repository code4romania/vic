import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #500: the NGO decides on applications (reason required on reject), can change its decision,
// and a volunteer who left asks to rejoin and waits for the NGO's approval.
describe('Volunteer applications (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  let elena: IAuthIdentityModel;
  let organizationId: string;
  let userId: string;

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  const web = async (): Promise<string> =>
    `Bearer ${await testApp.mintAccessToken(admin, AuthRealm.WEB)}`;
  const mobile = async (): Promise<string> =>
    `Bearer ${await testApp.mintAccessToken(elena, AuthRealm.MOBILE)}`;

  const apply = async (): Promise<string> => {
    const { body } = await http()
      .post('/mobile/access-request')
      .set('Authorization', await mobile())
      .send({
        organizationId,
        answers: [
          { question: 'De ce?', answer: 'Vreau să ajut' },
          { question: 'Experiență?', answer: 'Doi ani' },
        ],
      })
      .expect(201);
    return body.id;
  };

  const decide = async (
    id: string,
    decision: 'approve' | 'reject',
    status: number,
    body: Record<string, unknown> = {},
  ): Promise<request.Response> =>
    http()
      .post(`/access-request/${id}/${decision}`)
      .set('Authorization', await web())
      .send(body)
      .expect(status);

  const volunteers = async (): Promise<
    { id: string; status: string; archived_by: string | null }[]
  > =>
    testApp.dataSource.query(
      `SELECT id, status, archived_by FROM volunteer WHERE user_id = $1`,
      [userId],
    );

  const eventually = async (check: () => boolean): Promise<void> => {
    for (let i = 0; i < 50 && !check(); i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  };

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'auth_identity',
      'actions_archive',
      'activity_log',
      'access_request',
      'volunteer',
      'volunteer_profile',
      'user',
      'notifications_settings',
      'organization',
    ]);
    testApp.mailbox.clear();

    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ('Crucea', 'org@crucea.ro', '+40700000000', 'active', now()) RETURNING id`,
    );
    organizationId = organization.id;
    const [adminUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana Admin', 'ana@crucea.ro', '+40711111111', $1) RETURNING id`,
      [organizationId],
    );
    admin = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.WEB,
      email: 'ana@crucea.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: adminUser.id,
    });

    const [settings] = await testApp.dataSource.query(
      `INSERT INTO notifications_settings (notifications_via_email, notifications_via_push) VALUES (true, false) RETURNING id`,
    );
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, first_name, last_name, email, phone, birthday, notifications_settings_id)
       VALUES ('regular', 'Elena Pop', 'Elena', 'Pop', 'elena@example.ro', '+40722000000', '1995-04-12', $1) RETURNING id`,
      [settings.id],
    );
    userId = user.id;
    elena = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'elena@example.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId,
    });
  });

  it("searches new requests without diacritics and filters by the user's day in Romania", async () => {
    const id = await apply();
    // 20 November 2026, 00:30 in Bucharest (still the 19th in UTC)
    await testApp.dataSource.query(
      `UPDATE access_request SET created_on = '2026-11-19T22:30:00Z' WHERE id = $1`,
      [id],
    );
    await testApp.dataSource.query(
      `UPDATE "user" SET name = 'Elena Ștefănescu' WHERE id = $1`,
      [userId],
    );
    const found = async (query: Record<string, string>): Promise<number> =>
      (
        await http()
          .get('/access-request/new')
          .query(query)
          .set('Authorization', await web())
          .expect(200)
      ).body.items.length;

    expect(await found({ search: 'stefanescu' })).toBe(1);
    expect(await found({ search: 'ȘTEFĂNESCU' })).toBe(1);
    expect(await found({ search: 'popescu' })).toBe(0);

    // what the web sends for a day: wall-clock times with no zone
    const day = (d: string): Record<string, string> => ({
      createdOnStart: `${d} 00:00:00`,
      createdOnEnd: `${d} 23:59:59`,
    });
    expect(await found(day('2026-11-20'))).toBe(1);
    expect(await found(day('2026-11-19'))).toBe(0);
  });

  it('needs a reason to reject, and sends it to the volunteer', async () => {
    const id = await apply();

    await decide(id, 'reject', 400);
    await decide(id, 'reject', 400, { rejectionReason: '   ' });
    await decide(id, 'reject', 201, {
      rejectionReason: 'Nu mai avem locuri în acest an',
    });

    await eventually(() => !!testApp.mailbox.last('elena@example.ro'));
    expect(JSON.stringify(testApp.mailbox.last('elena@example.ro'))).toContain(
      'Nu mai avem locuri în acest an',
    );
  });

  it('lists approved requests, and turns a rejection into an approval', async () => {
    const id = await apply();
    await decide(id, 'reject', 201, { rejectionReason: 'Greșeală' });
    await decide(id, 'reject', 400, { rejectionReason: 'Din nou' });

    await decide(id, 'approve', 201);
    expect(await volunteers()).toEqual([
      expect.objectContaining({ status: 'active' }),
    ]);

    const { body } = await http()
      .get('/access-request/approved')
      .set('Authorization', await web())
      .expect(200);
    expect(body.items.map((item: { id: string }) => item.id)).toEqual([id]);
    await decide(id, 'approve', 400);
  });

  it('undoes an approval only while the volunteer has nothing logged', async () => {
    const id = await apply();
    await decide(id, 'approve', 201);
    const [volunteer] = await volunteers();

    await testApp.dataSource.query(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id) VALUES (now(), 4, 'approved', $1, $2)`,
      [volunteer.id, organizationId],
    );
    const { body } = await decide(id, 'reject', 400, {
      rejectionReason: 'Aprobat din greșeală',
    });
    expect(body.code_error).toBe('ACCESS_REQUEST_005');
    expect(await volunteers()).toHaveLength(1);

    await testApp.dataSource.query(`DELETE FROM activity_log`);
    await decide(id, 'reject', 201, {
      rejectionReason: 'Aprobat din greșeală',
    });
    expect(await volunteers()).toHaveLength(0);
  });

  it('lets a volunteer who left ask to rejoin; approving brings back the same record', async () => {
    await decide(await apply(), 'approve', 201);
    const [volunteer] = await volunteers();

    await http()
      .delete(`/mobile/organization/${volunteer.id}`)
      .set('Authorization', await mobile())
      .expect(200);

    const { body: organization } = await http()
      .patch(`/mobile/organization/${volunteer.id}/rejoin`)
      .set('Authorization', await mobile())
      .expect(200);
    expect(organization.organizationVolunteerStatus).toBe(
      'ACCESS_REQUEST_PENDING',
    );
    // still inactive until the NGO approves
    expect((await volunteers())[0].status).toBe('inactive');

    const [pending] = await testApp.dataSource.query(
      `SELECT id FROM access_request WHERE status = 'pending'`,
    );
    await decide(pending.id, 'approve', 201);
    expect(await volunteers()).toEqual([
      expect.objectContaining({ id: volunteer.id, status: 'active' }),
    ]);
  });

  // #593: the NGO's active admins are emailed when a volunteer leaves by themselves
  it("emails the NGO's active admins when a volunteer leaves", async () => {
    await decide(await apply(), 'approve', 201);
    const [volunteer] = await volunteers();
    // an invited admin who never logged in is left out
    const [invited] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ion Invitat', 'ion@crucea.ro', '+40733333333', $1) RETURNING id`,
      [organizationId],
    );
    await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.WEB,
      email: 'ion@crucea.ro',
      status: AuthIdentityStatus.PENDING,
      userId: invited.id,
    });
    testApp.mailbox.clear();

    await http()
      .delete(`/mobile/organization/${volunteer.id}`)
      .set('Authorization', await mobile())
      .expect(200);

    await eventually(() => !!testApp.mailbox.last('ana@crucea.ro'));
    const email = testApp.mailbox.last('ana@crucea.ro');
    expect(email.subject).toBe('Elena Pop a părăsit organizația');
    expect(email.context.subtitle).toContain('Crucea');
    expect(testApp.mailbox.to('ion@crucea.ro')).toEqual([]);

    // leaving also clears the volunteer's active organization after the response (not awaited by the
    // use case); let it finish before the app closes
    await new Promise((resolve) => setTimeout(resolve, 300));
  });
});
