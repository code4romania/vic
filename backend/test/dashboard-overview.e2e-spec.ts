import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

const DAY = 24 * 60 * 60 * 1000;
const days = (n: number): Date => new Date(Date.now() + n * DAY);

// #466 and #467: the dashboard counters, the next events and the latest announcement responses.
describe('Dashboard overview (e2e)', () => {
  let testApp: TestApp;
  let adminToken: string;
  let organizationId: string;
  let otherOrganizationId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (sql: string, params: unknown[] = []): Promise<any[]> =>
    testApp.dataSource.query(sql, params);

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'access_request',
      'announcement_response',
      'announcement',
      'event_rsvp',
      'event',
      'activity_log',
      'contract',
      'auth_identity',
      'volunteer',
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
  });

  const get = (path: string): request.Test =>
    request(testApp.app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

  const addUser = async (name: string, n: number): Promise<string> =>
    (
      await q(
        `INSERT INTO "user" (type, name, email, phone) VALUES ('regular', $1, $2, $3) RETURNING id`,
        [name, `u${n}@example.ro`, `+4072000000${n}`],
      )
    )[0].id;

  it('counts active volunteers, upcoming events, pending contracts and hours', async () => {
    const users = [
      await addUser('Elena', 1),
      await addUser('Mihai', 2),
      await addUser('Ion', 3),
    ];
    const [[v1], [v2]] = [
      await q(
        `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active') RETURNING id`,
        [users[0], organizationId],
      ),
      await q(
        `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active') RETURNING id`,
        [users[1], organizationId],
      ),
    ];
    await q(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'inactive')`,
      [users[2], organizationId],
    );
    await q(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active')`,
      [users[2], otherOrganizationId],
    );
    await q(
      `INSERT INTO access_request (answers, requested_by, organization_id, status)
       VALUES ('[]', $1, $2, 'pending')`,
      [users[2], organizationId],
    );
    for (const [hours, status, vol] of [
      [4, 'approved', v1.id],
      [6, 'approved', v2.id],
      [3, 'pending', v1.id],
    ]) {
      await q(
        `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id)
         VALUES (now(), $1, $2, $3, $4)`,
        [hours, status, vol, organizationId],
      );
    }
    await q(
      `INSERT INTO contract (contract_number, path, start_date, status, organization_id, volunteer_id) VALUES
         ('1', 'x', now(), 'INACTIVE', $1, $2),
         ('2', 'x', now(), 'ACTIVE', $1, $3)`,
      [organizationId, v1.id, v2.id],
    );
    for (const [start, status, org] of [
      [days(5), 'published', organizationId],
      [days(10), 'published', organizationId],
      [days(3), 'draft', organizationId],
      [days(-3), 'published', organizationId],
      [days(5), 'published', otherOrganizationId],
    ] as const) {
      await q(
        `INSERT INTO event (name, description, start_date, status, organization_id)
         VALUES ('E', '-', $1, $2, $3)`,
        [start, status, org],
      );
    }

    const { body } = await get('/dashboard/overview');
    expect(body).toEqual({
      activeVolunteers: 2,
      pendingAccessRequests: 1,
      upcomingEvents: 2,
      pendingContracts: 1,
      approvedHours: 10,
      pendingHours: 3,
    });
  });

  it('lists the next 3 published events with registrations and capacity', async () => {
    const userId = await addUser('Elena', 1);
    const ids: string[] = [];
    for (const [name, start, status, capacity] of [
      ['Ieri', days(-1), 'published', null],
      ['Curățenie', days(2), 'published', 20],
      ['Ciornă', days(1), 'draft', null],
      ['Maraton', days(4), 'published', null],
      ['Târg', days(6), 'published', 50],
      ['Concert', days(9), 'published', 10],
    ] as const) {
      const [row] = await q(
        `INSERT INTO event (name, description, start_date, status, organization_id, capacity, location)
         VALUES ($1, '-', $2, $3, $4, $5, 'Cluj') RETURNING id`,
        [name, start, status, organizationId, capacity],
      );
      ids.push(row.id);
    }
    await q(
      `INSERT INTO event_rsvp (going, event_id, user_id, status) VALUES (true, $1, $2, 'approved')`,
      [ids[1], userId],
    );

    const { body } = await get('/dashboard/upcoming-events');
    expect(body.map((e: { name: string }) => e.name)).toEqual([
      'Curățenie',
      'Maraton',
      'Târg',
    ]);
    expect(body[0]).toMatchObject({ going: 1, capacity: 20, location: 'Cluj' });
    expect(body[1]).toMatchObject({ going: 0, capacity: null });
  });

  it('lists the last 3 responses to the organization announcements', async () => {
    const userIds = [
      await addUser('Elena Pop', 1),
      await addUser('Mihai', 2),
      await addUser('Ion', 3),
      await addUser('Ana', 4),
      await addUser('Dan', 5),
    ];
    const [[mine], [theirs]] = [
      await q(
        `INSERT INTO announcement (name, description, status, organization_id, display_start_date)
         VALUES ('Strângere de fonduri', '-', 'active', $1, now()) RETURNING id`,
        [organizationId],
      ),
      await q(
        `INSERT INTO announcement (name, description, status, organization_id, display_start_date)
         VALUES ('Altceva', '-', 'active', $1, now()) RETURNING id`,
        [otherOrganizationId],
      ),
    ];
    for (const [comment, announcement, minutes, userId] of [
      ['Vin și eu', mine.id, 40, userIds[1]],
      ['Pot ajuta sâmbătă', mine.id, 30, userIds[2]],
      ['Altă organizație', theirs.id, 5, userIds[0]],
      ['Am mașină', mine.id, 20, userIds[3]],
      ['Aduc apă', mine.id, 10, userIds[0]],
    ] as const) {
      await q(
        `INSERT INTO announcement_response (comment, announcement_id, user_id, created_on)
         VALUES ($1, $2, $3, now() - make_interval(mins => $4))`,
        [comment, announcement, userId, minutes],
      );
    }

    const { body } = await get('/dashboard/announcement-responses');
    expect(body.map((r: { comment: string }) => r.comment)).toEqual([
      'Aduc apă',
      'Am mașină',
      'Pot ajuta sâmbătă',
    ]);
    expect(body[0]).toMatchObject({
      announcementId: mine.id,
      announcementName: 'Strângere de fonduri',
      volunteerName: 'Elena Pop',
    });
  });
});
