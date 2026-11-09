import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #480 / #485: the volunteer profile shows total approved hours, the number of events,
// and the events grouped into upcoming and finished.
describe('Volunteer events and counters (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  let otherAdmin: IAuthIdentityModel;
  let organizationId: string;
  let volunteerId: string;
  let userId: string;

  const get = async (
    path: string,
    status: number,
    by = admin,
  ): Promise<request.Response> =>
    request(testApp.app.getHttpServer())
      .get(path)
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(by, AuthRealm.WEB)}`,
      )
      .expect(status);

  const event = async (
    name: string,
    start: string,
    end: string | null,
    status = 'published',
    org = organizationId,
  ): Promise<string> => {
    const [row] = await testApp.dataSource.query(
      `INSERT INTO event (name, description, start_date, end_date, status, organization_id)
       VALUES ($1, 'd', now() + $2::interval, now() + $3::interval, $4, $5) RETURNING id`,
      [name, start, end, status, org],
    );
    return row.id;
  };

  const register = async (
    eventId: string,
    status: string | null = 'approved',
    going = true,
  ): Promise<void> => {
    await testApp.dataSource.query(
      `INSERT INTO event_rsvp (going, status, event_id, user_id) VALUES ($1, $2, $3, $4)`,
      [going, status, eventId, userId],
    );
  };

  const log = async (
    hours: number,
    status: string,
    eventId?: string,
  ): Promise<void> =>
    testApp.dataSource.query(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id, event_id) VALUES (now(), $1, $2, $3, $4, $5)`,
      [hours, status, volunteerId, organizationId, eventId ?? null],
    );

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'auth_identity',
      'activity_log',
      'event_rsvp',
      'event',
      'volunteer',
      'volunteer_profile',
      'user',
      'organization',
    ]);

    const organization = async (
      name: string,
      email: string,
    ): Promise<{ id: string; admin: IAuthIdentityModel }> => {
      const [org] = await testApp.dataSource.query(
        `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ($1, $2, $3, 'active', now()) RETURNING id`,
        [name, `contact@${name}.ro`, `+4070000${name.length}000`],
      );
      const [adminUser] = await testApp.dataSource.query(
        `INSERT INTO "user" (type, name, email, phone, organization_id) VALUES ('admin', 'Admin', $1, $3, $2) RETURNING id`,
        [email, org.id, `+4071111${name.length}111`],
      );
      const identity = await testApp.app
        .get(AuthIdentityFacade)
        .createIdentity({
          realm: AuthRealm.WEB,
          email,
          status: AuthIdentityStatus.ACTIVE,
          userId: adminUser.id,
        });
      return { id: org.id, admin: identity };
    };
    const first = await organization('crucea', 'ana@crucea.ro');
    organizationId = first.id;
    admin = first.admin;
    otherAdmin = (await organization('salvati', 'dan@salvati.ro')).admin;

    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone) VALUES ('regular', 'Elena Pop', 'elena@example.ro', '+40722000000') RETURNING id`,
    );
    userId = user.id;
    const [volunteer] = await testApp.dataSource.query(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active') RETURNING id`,
      [userId, organizationId],
    );
    volunteerId = volunteer.id;
  });

  it('groups the approved registrations into upcoming and finished, with the hours logged on each', async () => {
    const soon = await event('Curățenie', '2 days', '3 days');
    const later = await event('Maraton', '10 days', null);
    const ongoing = await event('Tabără', '-1 day', '1 day');
    const past = await event('Concert', '-10 days', '-9 days');
    const archived = await event('Gală', '5 days', '6 days', 'archived');
    await Promise.all(
      [soon, later, ongoing, past, archived].map((id) => register(id)),
    );
    // not counted: not going, pending, rejected, a draft, another organization's event
    await register(await event('Nu merg', '1 day', null), null, false);
    await register(await event('În așteptare', '1 day', null), 'pending');
    await register(await event('Respins', '1 day', null), 'rejected');
    await register(await event('Ciornă', '1 day', null, 'draft'));
    const [other] = await testApp.dataSource.query(
      `SELECT id FROM organization WHERE id <> $1`,
      [organizationId],
    );
    await register(
      await event('Alt ONG', '1 day', null, 'published', other.id),
    );
    await log(4, 'approved', past);
    await log(2, 'pending', past);

    const { body } = await get(`/volunteer/${volunteerId}/events`, 200);
    expect(body.upcoming.map((e: { name: string }) => e.name)).toEqual([
      'Tabără',
      'Curățenie',
      'Maraton',
    ]);
    expect(body.finished).toEqual([
      expect.objectContaining({ name: 'Gală', hours: 0 }),
      expect.objectContaining({ name: 'Concert', hours: 4 }),
    ]);
  });

  it('counts the approved hours and the events', async () => {
    await register(await event('Concert', '-10 days', '-9 days'));
    await register(await event('Maraton', '10 days', null));
    await log(4, 'approved');
    await log(3, 'approved');
    await log(9, 'pending');
    await log(1, 'rejected');

    const { body } = await get(`/volunteer/${volunteerId}/stats`, 200);
    expect(body).toEqual({ totalHours: 7, events: 2 });
  });

  it("does not show another organization's volunteer", async () => {
    await get(`/volunteer/${volunteerId}/events`, 403, otherAdmin);
    await get(`/volunteer/${volunteerId}/stats`, 403, otherAdmin);
  });
});
