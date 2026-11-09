import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #499 / #468: one endpoint gives the pending approvals per type and in total.
describe('Pending approvals (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  const orgs: string[] = [];
  const users: string[] = [];

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'auth_identity',
      'access_request',
      'activity_log',
      'event_rsvp',
      'event',
      'volunteer',
      'user',
      'organization',
    ]);
    orgs.length = 0;
    users.length = 0;
    for (const name of ['crucea', 'salvati']) {
      const [org] = await testApp.dataSource.query(
        `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ($1, $2, $3, 'active', now()) RETURNING id`,
        [name, `contact@${name}.ro`, `+4070000${name.length}000`],
      );
      orgs.push(org.id);
    }
    const [adminUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id) VALUES ('admin', 'Ana', 'ana@crucea.ro', '+40711111111', $1) RETURNING id`,
      [orgs[0]],
    );
    admin = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.WEB,
      email: 'ana@crucea.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: adminUser.id,
    });
    for (const n of [1, 2, 3]) {
      const [user] = await testApp.dataSource.query(
        `INSERT INTO "user" (type, name, email, phone) VALUES ('regular', $1, $2, $3) RETURNING id`,
        [`Voluntar ${n}`, `v${n}@example.ro`, `+4072200000${n}`],
      );
      users.push(user.id);
    }
  });

  it('counts only what is pending, in the admin organization', async () => {
    const [own, other] = orgs;
    // volunteer applications: 2 pending here, 1 rejected, 1 pending in the other NGO, 1 deleted
    for (const [user, org, status, deleted] of [
      [users[0], own, 'pending', false],
      [users[1], own, 'pending', false],
      [users[2], own, 'rejected', false],
      [users[0], other, 'pending', false],
      [users[2], own, 'pending', true],
    ] as const) {
      await testApp.dataSource.query(
        `INSERT INTO access_request (requested_by, organization_id, status, answers, deleted_on) VALUES ($1, $2, $3, '[]', ${deleted ? 'now()' : 'NULL'})`,
        [user, org, status],
      );
    }
    // hours: 1 pending here, 1 approved, 1 pending elsewhere
    const [volunteer] = await testApp.dataSource.query(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active') RETURNING id`,
      [users[0], own],
    );
    const [otherVolunteer] = await testApp.dataSource.query(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active') RETURNING id`,
      [users[0], other],
    );
    await testApp.dataSource.query(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id) VALUES
         (now(), 2, 'pending', $1, $2), (now(), 3, 'approved', $1, $2), (now(), 4, 'pending', $3, $4)`,
      [volunteer.id, own, otherVolunteer.id, other],
    );
    // event registrations: 2 pending here (one per event), 1 not going, 1 approved, 1 elsewhere
    const event = async (org: string): Promise<string> =>
      (
        await testApp.dataSource.query(
          `INSERT INTO event (name, description, start_date, organization_id) VALUES ('E', 'd', now(), $1) RETURNING id`,
          [org],
        )
      )[0].id;
    const [e1, e2, e3] = [
      await event(own),
      await event(own),
      await event(other),
    ];
    await testApp.dataSource.query(
      `INSERT INTO event_rsvp (going, status, event_id, user_id) VALUES
         (true, 'pending', $1, $4), (true, 'pending', $2, $4), (false, NULL, $1, $5),
         (true, 'approved', $2, $5), (true, 'pending', $3, $4)`,
      [e1, e2, e3, users[0], users[1]],
    );

    const { body } = await request(testApp.app.getHttpServer())
      .get('/dashboard/pending-approvals')
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(admin, AuthRealm.WEB)}`,
      )
      .expect(200);

    expect(body).toEqual({
      accessRequests: 2,
      activityLogs: 1,
      eventRegistrations: 2,
      total: 5,
    });
  });
});
