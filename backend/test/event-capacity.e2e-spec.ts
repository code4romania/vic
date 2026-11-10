import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// B7 / M13 / M7: the capacity holds for automatic approvals, NGO approvals and direct adds, also when
// answers arrive at the same time; a rejection survives a cancel; dates and capacity are consistent;
// a suspended or unvalidated NGO's events take no registrations.
describe('Event capacity and registration rules (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  let organizationId: string;
  let eventId: string;
  const people: Record<string, IAuthIdentityModel> = {};
  const volunteerIds: Record<string, string> = {};

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  const adminAuth = async (): Promise<string> =>
    `Bearer ${await testApp.mintAccessToken(admin, AuthRealm.WEB)}`;

  const rsvp = async (
    name: string,
    going: boolean,
    expected?: number,
  ): Promise<request.Response> => {
    const response = await http()
      .patch(`/mobile/event/${eventId}/rsvp`)
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(people[name], AuthRealm.MOBILE)}`,
      )
      .send({ going });
    if (expected) expect(response.status).toBe(expected);
    return response;
  };

  const statusOf = async (name: string): Promise<string | null> => {
    const [row] = await testApp.dataSource.query(
      `SELECT r.status, r.going FROM event_rsvp r JOIN "user" u ON u.id = r.user_id WHERE u.name = $1 AND r.event_id = $2`,
      [name, eventId],
    );
    return row ? `${row.going ? 'going' : 'not going'}:${row.status}` : null;
  };

  const approvedCount = async (): Promise<number> => {
    const [row] = await testApp.dataSource.query(
      `SELECT count(*) AS n FROM event_rsvp WHERE event_id = $1 AND going AND status = 'approved'`,
      [eventId],
    );
    return +row.n;
  };

  const setCapacity = (capacity: number | null): Promise<unknown> =>
    testApp.dataSource.query(`UPDATE event SET capacity = $2 WHERE id = $1`, [
      eventId,
      capacity,
    ]);

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'auth_identity',
      'event_rsvp',
      'event_targets_organization_structure',
      'event',
      'volunteer',
      'volunteer_profile',
      'organization_structure',
      'user',
      'organization',
    ]);
    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ('Org', 'org@example.ro', '+40700000000', 'active', now()) RETURNING id`,
    );
    organizationId = organization.id;
    const [adminUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana Admin', 'admin@example.ro', '+40711111111', $1) RETURNING id`,
      [organizationId],
    );
    admin = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.WEB,
      email: 'admin@example.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: adminUser.id,
    });

    // five active volunteers with a profile: all approved automatically on an event for everyone
    for (const name of ['V1', 'V2', 'V3', 'V4', 'V5']) {
      const email = `${name.toLowerCase()}@example.ro`;
      const [user] = await testApp.dataSource.query(
        `INSERT INTO "user" (type, name, email, phone) VALUES ('regular', $1, $2, '+40722000000') RETURNING id`,
        [name, email],
      );
      const [profile] = await testApp.dataSource.query(
        `INSERT INTO volunteer_profile (email) VALUES ($1) RETURNING id`,
        [email],
      );
      const [volunteer] = await testApp.dataSource.query(
        `INSERT INTO volunteer (user_id, organization_id, status, volunteer_profile_id) VALUES ($1, $2, 'active', $3) RETURNING id`,
        [user.id, organizationId, profile.id],
      );
      volunteerIds[name] = volunteer.id;
      people[name] = await testApp.app.get(AuthIdentityFacade).createIdentity({
        realm: AuthRealm.MOBILE,
        email,
        status: AuthIdentityStatus.ACTIVE,
        userId: user.id,
      });
    }

    const [event] = await testApp.dataSource.query(
      `INSERT INTO event (name, description, start_date, end_date, organization_id, status, capacity, is_public)
       VALUES ('Maraton', 'd', now() + interval '1 day', now() + interval '2 days', $1, 'published', 2, false) RETURNING id`,
      [organizationId],
    );
    eventId = event.id;
  });

  it('automatic approvals stop at the capacity: 400 EVENT_RSVP_008', async () => {
    await rsvp('V1', true, 200);
    await rsvp('V2', true, 200);
    const full = await rsvp('V3', true, 400);
    expect(full.body.code_error).toBe('EVENT_RSVP_008');
    expect(await approvedCount()).toBe(2);

    // a seat freed by a cancel can be taken again
    await rsvp('V1', false, 200);
    await rsvp('V3', true, 200);
    expect(await statusOf('V3')).toBe('going:approved');
    expect(await approvedCount()).toBe(2);
  });

  it('concurrent answers never take more seats than the event has', async () => {
    await setCapacity(1);
    const responses = await Promise.all(
      ['V1', 'V2', 'V3', 'V4', 'V5'].map((name) => rsvp(name, true)),
    );
    expect(responses.filter((r) => r.status === 200)).toHaveLength(1);
    expect(
      responses
        .filter((r) => r.status !== 200)
        .map((r) => [r.status, r.body.code_error]),
    ).toEqual(Array(4).fill([400, 'EVENT_RSVP_008']));
    expect(await approvedCount()).toBe(1);
  });

  it('adding volunteers directly respects the capacity, also concurrently', async () => {
    const add = async (names: string[]): Promise<request.Response> =>
      http()
        .post(`/event/${eventId}/volunteers`)
        .set('Authorization', await adminAuth())
        .send({ volunteerIds: names.map((name) => volunteerIds[name]) });

    const responses = await Promise.all([
      add(['V1', 'V2']),
      add(['V3', 'V4']),
      add(['V5']),
    ]);
    expect(await approvedCount()).toBeLessThanOrEqual(2);
    expect(responses.some((r) => r.body.code_error === 'EVENT_RSVP_008')).toBe(
      true,
    );
  });

  it('a rejected volunteer who cancels and answers again is not approved automatically', async () => {
    await rsvp('V1', true, 200);
    const [{ id }] = await testApp.dataSource.query(
      `SELECT r.id FROM event_rsvp r JOIN "user" u ON u.id = r.user_id WHERE u.name = 'V1'`,
    );
    await http()
      .patch(`/event-registrations/${id}/reject`)
      .set('Authorization', await adminAuth())
      .send({ reason: 'Nu de data aceasta' })
      .expect(200);

    await rsvp('V1', false, 200);
    expect(await statusOf('V1')).toBe('not going:rejected');
    await rsvp('V1', true, 200);
    expect(await statusOf('V1')).toBe('going:pending');

    // cancelling through DELETE keeps the rejection too
    await http()
      .delete(`/mobile/event/${eventId}/rsvp`)
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(people.V1, AuthRealm.MOBILE)}`,
      )
      .expect(200);
    expect(await statusOf('V1')).toBe('not going:rejected');
    await rsvp('V1', true, 200);
    expect(await statusOf('V1')).toBe('going:pending');

    // once the NGO approves, the marker is gone
    await http()
      .patch(`/event-registrations/${id}/approve`)
      .set('Authorization', await adminAuth())
      .expect(200);
    await rsvp('V1', false, 200);
    await rsvp('V1', true, 200);
    expect(await statusOf('V1')).toBe('going:approved');
  });

  it("refuses registrations to a suspended or unvalidated NGO's events: 403 ORG_005", async () => {
    await testApp.dataSource.query(
      `UPDATE organization SET validated_at = NULL`,
    );
    expect((await rsvp('V1', true, 403)).body.code_error).toBe('ORG_005');
    await testApp.dataSource.query(
      `UPDATE organization SET validated_at = now(), status = 'suspended'`,
    );
    expect((await rsvp('V1', true, 403)).body.code_error).toBe('ORG_005');
  });

  it('checks the dates and does not lower the capacity below the approved registrations', async () => {
    const created = await http()
      .post('/event')
      .set('Authorization', await adminAuth())
      .send({
        name: 'Invers',
        description: 'descriere',
        startDate: new Date(Date.now() + 2 * 86400000),
        endDate: new Date(Date.now() + 86400000),
        status: 'draft',
        isPublic: 'public',
      })
      .expect(400);
    expect(created.body.code_error).toBe('EVENT_010');

    const patched = await http()
      .patch(`/event/${eventId}`)
      .set('Authorization', await adminAuth())
      .send({ endDate: new Date(Date.now() - 86400000) })
      .expect(400);
    expect(patched.body.code_error).toBe('EVENT_010');

    await rsvp('V1', true, 200);
    await rsvp('V2', true, 200);
    const lowered = await http()
      .patch(`/event/${eventId}`)
      .set('Authorization', await adminAuth())
      .send({ capacity: 1 })
      .expect(400);
    expect(lowered.body.code_error).toBe('EVENT_011');
    await http()
      .patch(`/event/${eventId}`)
      .set('Authorization', await adminAuth())
      .send({ capacity: 3 })
      .expect(200);
  });

  it("hides a suspended or unvalidated NGO's events from the app and refuses to publish them", async () => {
    const names = async (eventFilter: string): Promise<string[]> => {
      const response = await http()
        .get('/mobile/event')
        .query({ eventFilter, limit: 20, page: 1 })
        .set(
          'Authorization',
          `Bearer ${await testApp.mintAccessToken(people.V1, AuthRealm.MOBILE)}`,
        )
        .expect(200);
      return response.body.items.map((e: { name: string }) => e.name);
    };
    await rsvp('V1', true, 200);
    expect(await names('OPEN')).toEqual(['Maraton']);
    expect(await names('GOING')).toEqual(['Maraton']);

    await testApp.dataSource.query(
      `UPDATE organization SET status = 'suspended'`,
    );
    expect(await names('OPEN')).toEqual([]);
    expect(await names('ORGANIZATIONS')).toEqual([]);
    expect(await names('GOING')).toEqual([]);

    // a suspended NGO's admins cannot log in; an unvalidated one's can, but cannot publish
    await testApp.dataSource.query(
      `UPDATE organization SET status = 'active', validated_at = NULL`,
    );
    expect(await names('OPEN')).toEqual([]);
    await testApp.dataSource.query(`UPDATE event SET status = 'draft'`);
    const publish = await http()
      .patch(`/event/${eventId}/publish`)
      .set('Authorization', await adminAuth())
      .expect(403);
    expect(publish.body.code_error).toBe('ORG_005');
  });
});
