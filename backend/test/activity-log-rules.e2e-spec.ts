import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

const DAY = 24 * 60 * 60 * 1000;
const day = (offset: number): string =>
  new Date(Date.now() + offset * DAY).toLocaleDateString('en-CA', {
    timeZone: 'Europe/Bucharest',
  });

// M12: hours are whole, not in the future, at most 24 a day, not logged twice, never on a draft
// event; editing keeps what is not sent, null removes the event.
describe('Activity log rules (e2e)', () => {
  let testApp: TestApp;
  let token: string;
  let organizationId: string;
  let volunteerId: string;
  let publishedEventId: string;
  let draftEventId: string;
  let typeId: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (sql: string, params: unknown[] = []): Promise<any[]> =>
    testApp.dataSource.query(sql, params);

  const http = (): ReturnType<typeof request> =>
    request(testApp.app.getHttpServer());

  const log = (body: Record<string, unknown>): request.Test =>
    http()
      .post('/activity-log')
      .set('Authorization', `Bearer ${token}`)
      .send({ volunteerId, date: day(-1), hours: 2, ...body });

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'actions_archive',
      'activity_log',
      'activity_type',
      'event',
      'auth_identity',
      'volunteer',
      'volunteer_profile',
      'user',
      'organization',
      'notifications_settings',
    ]);
    [{ id: organizationId }] = await q(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Org', 'org@example.ro', '+40700000000', 'active', now()) RETURNING id`,
    );
    const [admin] = await q(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana', 'ana@example.ro', '+40711111111', $1) RETURNING id`,
      [organizationId],
    );
    token = await testApp.mintAccessToken(
      await testApp.app.get(AuthIdentityFacade).createIdentity({
        realm: AuthRealm.WEB,
        email: 'ana@example.ro',
        status: AuthIdentityStatus.ACTIVE,
        userId: admin.id,
      }),
      AuthRealm.WEB,
    );
    const [settings] = await q(
      `INSERT INTO notifications_settings DEFAULT VALUES RETURNING id`,
    );
    const [user] = await q(
      `INSERT INTO "user" (type, name, email, phone, notifications_settings_id) VALUES ('regular', 'Vlad', 'vlad@example.ro', '+40722000000', $1) RETURNING id`,
      [settings.id],
    );
    const [profile] = await q(
      `INSERT INTO volunteer_profile (email) VALUES ('vlad@example.ro') RETURNING id`,
    );
    [{ id: volunteerId }] = await q(
      `INSERT INTO volunteer (user_id, organization_id, status, volunteer_profile_id) VALUES ($1, $2, 'active', $3) RETURNING id`,
      [user.id, organizationId, profile.id],
    );
    [{ id: publishedEventId }] = await q(
      `INSERT INTO event (name, description, start_date, organization_id, status) VALUES ('Publicat', 'd', now() - interval '2 days', $1, 'published') RETURNING id`,
      [organizationId],
    );
    [{ id: draftEventId }] = await q(
      `INSERT INTO event (name, description, start_date, organization_id, status) VALUES ('Ciornă', 'd', now() - interval '2 days', $1, 'draft') RETURNING id`,
      [organizationId],
    );
    [{ id: typeId }] = await q(
      `INSERT INTO activity_type (name, icon, organization_id) VALUES ('Sortare', 'x', $1) RETURNING id`,
      [organizationId],
    );
  });

  it('refuses future dates, partial hours, more than 24 hours a day, duplicates and draft events', async () => {
    expect((await log({ date: day(2) }).expect(400)).body.code_error).toBe(
      'ACTIVITY_LOG_007',
    );
    await log({ hours: 2.5 }).expect(400);
    await log({ hours: 25 }).expect(400);
    expect(
      (await log({ eventId: draftEventId }).expect(400)).body.code_error,
    ).toBe('ACTIVITY_LOG_010');

    await log({ eventId: publishedEventId, hours: 10 }).expect(201);
    expect(
      (await log({ eventId: publishedEventId, hours: 1 }).expect(400)).body
        .code_error,
    ).toBe('ACTIVITY_LOG_009');
    // another activity type the same day is not a duplicate, but the day is full at 24
    await log({ activityTypeId: typeId, hours: 14 }).expect(201);
    expect((await log({ hours: 1 }).expect(400)).body.code_error).toBe(
      'ACTIVITY_LOG_008',
    );
    // today is fine
    await log({ date: day(0), hours: 3 }).expect(201);
  });

  it('edits only what is sent: adds an event to a log without one, keeps the type, null removes the event', async () => {
    const [pending] = await q(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id, activity_type_id)
       VALUES ($1, 2, 'pending', $2, $3, $4) RETURNING id`,
      [day(-3), volunteerId, organizationId, typeId],
    );
    const patch = (body: Record<string, unknown>): request.Test =>
      http()
        .patch(`/activity-log/${pending.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(body);
    const row = async (): Promise<Record<string, unknown>> =>
      (
        await q(
          `SELECT event_id, activity_type_id, hours FROM activity_log WHERE id = $1`,
          [pending.id],
        )
      )[0];

    await patch({ eventId: publishedEventId }).expect(200);
    expect(await row()).toMatchObject({
      event_id: publishedEventId,
      activity_type_id: typeId,
    });

    await patch({ hours: 4 }).expect(200);
    expect(await row()).toMatchObject({
      hours: 4,
      event_id: publishedEventId,
      activity_type_id: typeId,
    });

    await patch({ eventId: null }).expect(200);
    expect(await row()).toMatchObject({
      event_id: null,
      activity_type_id: typeId,
    });

    expect(
      (await patch({ eventId: draftEventId }).expect(400)).body.code_error,
    ).toBe('ACTIVITY_LOG_010');
    await patch({ hours: 1.5 }).expect(400);
  });

  it('logs, approves and rejects hours of a volunteer without notification settings (no account), not a 500', async () => {
    await q(
      `UPDATE "user" SET notifications_settings_id = NULL WHERE type = 'regular'`,
    );
    const created = await log({ hours: 2 }).expect(201);
    const [pending] = await q(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id)
       VALUES ($1, 1, 'pending', $2, $3) RETURNING id`,
      [day(-2), volunteerId, organizationId],
    );
    await http()
      .patch(`/activity-log/${pending.id}/approve`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const [other] = await q(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id)
       VALUES ($1, 1, 'pending', $2, $3) RETURNING id`,
      [day(-3), volunteerId, organizationId],
    );
    await http()
      .patch(`/activity-log/${other.id}/reject`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rejectionReason: 'Nu' })
      .expect(200);
    expect(created.body.id).toBeDefined();
  });
});
