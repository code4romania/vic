import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #484: the NGO deletes a volunteer together with all their data in that NGO, and only there.
describe('Delete volunteer (e2e)', () => {
  let testApp: TestApp;
  let adminToken: string;
  let organizationId: string;
  let otherOrganizationId: string;
  let userId: string;
  let volunteerId: string;
  let otherVolunteerId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (sql: string, params: unknown[] = []): Promise<any[]> =>
    testApp.dataSource.query(sql, params);
  const count = async (sql: string, params: unknown[]): Promise<number> =>
    +(await q(sql, params))[0].count;

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'actions_archive',
      'access_request',
      'announcement_response',
      'announcement',
      'event_rsvp',
      'event',
      'activity_log',
      'contract',
      'auth_identity',
      'volunteer_history',
      'volunteer',
      'volunteer_profile',
      'user',
      'organization',
    ]);
    [{ id: organizationId }] = await q(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Crucea Verde', 'org@crucea.ro', '+40700000001', 'active', now()) RETURNING id`,
    );
    [{ id: otherOrganizationId }] = await q(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Alt ONG', 'org@alt.ro', '+40700000002', 'active', now()) RETURNING id`,
    );
    const [admin] = await q(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana', 'ana@crucea.ro', '+40710000002', $1) RETURNING id`,
      [organizationId],
    );
    adminToken = await testApp.mintAccessToken(
      await testApp.app.get(AuthIdentityFacade).createIdentity({
        realm: AuthRealm.WEB,
        email: 'ana@crucea.ro',
        status: AuthIdentityStatus.ACTIVE,
        userId: admin.id,
      }),
      AuthRealm.WEB,
    );
    [{ id: userId }] = await q(
      `INSERT INTO "user" (type, name, email, phone, active_organization_id)
       VALUES ('regular', 'Elena Pop', 'elena@example.ro', '+40720000001', $1) RETURNING id`,
      [organizationId],
    );
    const [profile] = await q(
      `INSERT INTO volunteer_profile (email) VALUES ('elena@crucea.ro') RETURNING id`,
    );
    [{ id: volunteerId }] = await q(
      `INSERT INTO volunteer (user_id, organization_id, status, volunteer_profile_id)
       VALUES ($1, $2, 'blocked', $3) RETURNING id`,
      [userId, organizationId, profile.id],
    );
    [{ id: otherVolunteerId }] = await q(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active') RETURNING id`,
      [userId, otherOrganizationId],
    );

    // data in both NGOs
    for (const [orgId, volId] of [
      [organizationId, volunteerId],
      [otherOrganizationId, otherVolunteerId],
    ]) {
      await q(
        `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id)
         VALUES (now(), 4, 'approved', $1, $2)`,
        [volId, orgId],
      );
      await q(
        `INSERT INTO contract (contract_number, path, start_date, status, organization_id, volunteer_id)
         VALUES ('1', 'contracts/x.pdf', now(), 'ACTIVE', $1, $2)`,
        [orgId, volId],
      );
      const [event] = await q(
        `INSERT INTO event (name, description, start_date, organization_id)
         VALUES ('Curățenie', '-', now(), $1) RETURNING id`,
        [orgId],
      );
      await q(
        `INSERT INTO event_rsvp (going, event_id, user_id) VALUES (true, $1, $2)`,
        [event.id, userId],
      );
      const [announcement] = await q(
        `INSERT INTO announcement (name, description, status, organization_id, display_start_date)
         VALUES ('Anunț', '-', 'active', $1, now()) RETURNING id`,
        [orgId],
      );
      await q(
        `INSERT INTO announcement_response (comment, announcement_id, user_id, volunteer_id)
         VALUES ('Vin', $1, $2, $3)`,
        [announcement.id, userId, volId],
      );
      await q(
        `INSERT INTO access_request (answers, requested_by, organization_id, status)
         VALUES ('[]', $1, $2, 'approved')`,
        [userId, orgId],
      );
    }
  });

  const http = (): ReturnType<typeof request> =>
    request(testApp.app.getHttpServer());

  it('removes everything in this NGO, keeps the other NGO, and logs it', async () => {
    const { body } = await http()
      .delete(`/volunteer/${volunteerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(body).toEqual({
      activityLogs: 1,
      contracts: 1,
      registrations: 1,
      announcementResponses: 1,
    });

    expect(
      await count(`SELECT count(*) FROM volunteer WHERE id = $1`, [
        volunteerId,
      ]),
    ).toBe(0);
    expect(await count(`SELECT count(*) FROM volunteer_profile`, [])).toBe(0);
    for (const table of ['activity_log', 'contract', 'announcement_response']) {
      expect(
        await count(`SELECT count(*) FROM ${table} WHERE volunteer_id = $1`, [
          otherVolunteerId,
        ]),
      ).toBe(1);
      expect(await count(`SELECT count(*) FROM ${table}`, [])).toBe(1);
    }
    expect(await count(`SELECT count(*) FROM event_rsvp`, [])).toBe(1);
    expect(await count(`SELECT count(*) FROM access_request`, [])).toBe(1);
    expect(
      await count(`SELECT count(*) FROM "user" WHERE id = $1`, [userId]),
    ).toBe(1);

    // the app moves the user to the NGO they still volunteer in
    const [user] = await q(
      `SELECT active_organization_id FROM "user" WHERE id = $1`,
      [userId],
    );
    expect(user.active_organization_id).toBe(otherOrganizationId);

    await new Promise((resolve) => setTimeout(resolve, 300));
    const [log] = await q(
      `SELECT event_name, event_data FROM actions_archive WHERE event_name = 'DELETE_VOLUNTEER'`,
    );
    expect(log.event_data).toMatchObject({
      volunteerId,
      volunteerName: 'Elena Pop',
      activityLogs: 1,
    });
  });

  it('cannot delete a volunteer of another NGO', async () => {
    await http()
      .delete(`/volunteer/${otherVolunteerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);
    expect(await count(`SELECT count(*) FROM volunteer`, [])).toBe(2);
  });
});
