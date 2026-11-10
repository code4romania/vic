import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { SessionService } from 'src/modules/auth/services/session.service';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// Mobile authorization audit: the volunteer is always the user of the token. Elena and Ion are
// both volunteers of Crucea Verde; nothing of Ion's can be read or changed with Elena's token.
describe('Mobile authorization (e2e)', () => {
  let testApp: TestApp;
  let orgA: string;
  let orgB: string;
  let departmentId: string;

  let elena: { userId: string; token: string; volunteerId: string };
  let ion: { userId: string; token: string; volunteerId: string };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (sql: string, params: unknown[] = []): Promise<any[]> =>
    testApp.dataSource.query(sql, params);

  type Client = Record<
    'get' | 'post' | 'patch' | 'delete',
    (url: string) => request.Test
  >;

  const as = (token: string): Client => {
    const server = testApp.app.getHttpServer();
    return {
      get: (url: string): request.Test =>
        request(server).get(url).set('Authorization', `Bearer ${token}`),
      post: (url: string): request.Test =>
        request(server).post(url).set('Authorization', `Bearer ${token}`),
      patch: (url: string): request.Test =>
        request(server).patch(url).set('Authorization', `Bearer ${token}`),
      delete: (url: string): request.Test =>
        request(server).delete(url).set('Authorization', `Bearer ${token}`),
    };
  };

  const identity = (
    email: string,
    userId?: string,
  ): ReturnType<AuthIdentityFacade['createIdentity']> =>
    testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.MOBILE,
      email,
      status: AuthIdentityStatus.ACTIVE,
      userId,
    });

  const createVolunteer = async (
    name: string,
    email: string,
  ): Promise<{ userId: string; token: string; volunteerId: string }> => {
    const [settings] = await q(
      `INSERT INTO notifications_settings (notifications_via_email, notifications_via_push) VALUES (false, false) RETURNING id`,
    );
    const [{ id: userId }] = await q(
      `INSERT INTO "user" (type, name, email, phone, active_organization_id, has_account, notifications_settings_id, birthday)
       VALUES ('regular', $1, $2, '+40720000001', $3, true, $4, '1990-01-01') RETURNING id`,
      [name, email, orgA, settings.id],
    );
    const [{ id: profileId }] = await q(
      `INSERT INTO volunteer_profile (email, department_id) VALUES ($1, $2) RETURNING id`,
      [email, departmentId],
    );
    const [{ id: volunteerId }] = await q(
      `INSERT INTO volunteer (user_id, organization_id, status, volunteer_profile_id, notes)
       VALUES ($1, $2, 'active', $3, 'notă internă a ONG-ului') RETURNING id`,
      [userId, orgA, profileId],
    );
    const token = await testApp.mintAccessToken(
      await identity(email, userId),
      AuthRealm.MOBILE,
    );
    return { userId, token, volunteerId };
  };

  const insertLog = async (
    volunteerId: string,
    hours: number,
  ): Promise<string> => {
    const [{ id }] = await q(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id)
       VALUES (now(), $1, 'pending', $2, $3) RETURNING id`,
      [hours, volunteerId, orgA],
    );
    return id as string;
  };

  const insertContract = async (
    volunteerId: string,
    number: string,
  ): Promise<string> => {
    const [{ id }] = await q(
      `INSERT INTO contract (contract_number, path, start_date, end_date, status, organization_id, volunteer_id)
       VALUES ($1, 'contracts/x.pdf', now(), NULL, 'ACTIVE', $2, $3) RETURNING id`,
      [number, orgA, volunteerId],
    );
    return id as string;
  };

  const insertEvent = async (
    organizationId: string,
    { status = 'published', isPublic = false } = {},
  ): Promise<string> => {
    const [{ id }] = await q(
      `INSERT INTO event (name, description, start_date, end_date, status, organization_id, is_public)
       VALUES ('Eveniment', 'd', now() + interval '1 day', now() + interval '2 days', $1, $2, $3) RETURNING id`,
      [status, organizationId, isPublic],
    );
    return id as string;
  };

  const noActiveOrganization = (userId: string): Promise<unknown> =>
    q(`UPDATE "user" SET active_organization_id = NULL WHERE id = $1`, [
      userId,
    ]);

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'actions_archive',
      'auth_identity',
      'push_tokens',
      'announcement',
      'event',
      'contract',
      'activity_log',
      'volunteer',
      'volunteer_profile',
      'organization_structure',
      'user',
      'notifications_settings',
      'organization',
    ]);
    [{ id: orgA }] = await q(
      `INSERT INTO organization (name, email, phone, status, validated_at, logo)
       VALUES ('Crucea Verde', 'org@crucea.ro', '+40700000001', 'active', now(), 'logo-a.png') RETURNING id`,
    );
    [{ id: orgB }] = await q(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Alt ONG', 'alt@ong.ro', '+40700000002', 'active', now()) RETURNING id`,
    );
    const [admin] = await q(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana', 'ana@crucea.ro', '+40710000002', $1) RETURNING id`,
      [orgA],
    );
    [{ id: departmentId }] = await q(
      `INSERT INTO organization_structure (name, type, organization_id, created_by) VALUES ('Logistică', 'department', $1, $2) RETURNING id`,
      [orgA, admin.id],
    );
    elena = await createVolunteer('Elena Pop', 'elena@example.ro');
    ion = await createVolunteer('Ion Ionescu', 'ion@example.ro');
  });

  describe('activity logs (B2)', () => {
    it("cannot read, change or cancel another volunteer's hours; own ones work", async () => {
      const ionLog = await insertLog(ion.volunteerId, 3);
      const elenaLog = await insertLog(elena.volunteerId, 2);
      const e = as(elena.token);

      await e.get(`/mobile/activity-log/${ionLog}`).expect(404);
      await e
        .patch(`/mobile/activity-log/${ionLog}`)
        .send({ hours: 9 })
        .expect(404);
      await e.delete(`/mobile/activity-log/${ionLog}`).expect(404);
      const [still] = await q(
        `SELECT hours, status FROM activity_log WHERE id = $1`,
        [ionLog],
      );
      expect(still).toEqual({ hours: 3, status: 'pending' });

      await e.get(`/mobile/activity-log/${elenaLog}`).expect(200);
      await e.delete(`/mobile/activity-log/${elenaLog}`).expect(200);
    });

    it("creates hours only for the user's own volunteer", async () => {
      const e = as(elena.token);
      const body = { date: '2026-01-10', hours: 2 };

      const forIon = await e
        .post('/mobile/activity-log')
        .send({ ...body, volunteerId: ion.volunteerId })
        .expect(404);
      expect(forIon.body.code_error).toBe('VOLUNTEER_001');

      await e.post('/mobile/activity-log').send(body).expect(201);
      await e
        .post('/mobile/activity-log')
        .send({ ...body, volunteerId: elena.volunteerId })
        .expect(201);

      const rows = await q(`SELECT volunteer_id FROM activity_log`);
      expect(rows.map((r) => r.volunteer_id)).toEqual([
        elena.volunteerId,
        elena.volunteerId,
      ]);
    });

    it("counters are the user's own, whatever volunteerId is asked for", async () => {
      await insertLog(ion.volunteerId, 7);
      await insertLog(elena.volunteerId, 2);

      const res = await as(elena.token)
        .get(`/mobile/activity-log/counters?volunteerId=${ion.volunteerId}`)
        .expect(200);
      expect(Number(res.body.pending)).toBe(2);
    });

    it('a volunteer without an active organization gets empty results, not 500', async () => {
      await insertLog(elena.volunteerId, 2);
      await noActiveOrganization(elena.userId);
      const e = as(elena.token);

      const list = await e
        .get('/mobile/activity-log?resolutionStatus=new')
        .expect(200);
      expect(list.body.items).toEqual([]);
      const counters = await e.get('/mobile/activity-log/counters').expect(200);
      expect(counters.body).toEqual({ pending: 0, approved: 0, rejected: 0 });
      const create = await e
        .post('/mobile/activity-log')
        .send({ date: '2026-01-10', hours: 2 })
        .expect(400);
      expect(create.body.code_error).toBe('VOLUNTEER_005');
    });
  });

  describe('contracts (B3)', () => {
    it("cannot list or open another volunteer's contracts", async () => {
      const ionContract = await insertContract(ion.volunteerId, 'C-ION');
      const elenaContract = await insertContract(elena.volunteerId, 'C-EL');
      const e = as(elena.token);

      await e
        .get(`/mobile/contract/history?volunteerId=${ion.volunteerId}`)
        .expect(404);
      await e.get(`/mobile/contract/${ionContract}`).expect(404);

      const own = await e
        .get(`/mobile/contract/history?volunteerId=${elena.volunteerId}`)
        .expect(200);
      expect(own.body.items.map((c: { id: string }) => c.id)).toEqual([
        elenaContract,
      ]);
      const byDefault = await e.get('/mobile/contract/history').expect(200);
      expect(byDefault.body.items.map((c: { id: string }) => c.id)).toEqual([
        elenaContract,
      ]);
      await e.get(`/mobile/contract/${elenaContract}`).expect(200);
    });

    it('a volunteer without an active organization gets an empty history', async () => {
      await insertContract(elena.volunteerId, 'C-EL');
      await noActiveOrganization(elena.userId);

      const res = await as(elena.token)
        .get('/mobile/contract/history')
        .expect(200);
      expect(res.body.items).toEqual([]);
    });
  });

  it('cannot make another volunteer leave the organization (B4)', async () => {
    await as(elena.token)
      .delete(`/mobile/organization/${ion.volunteerId}`)
      .expect(404);
    const [ionVolunteer] = await q(
      `SELECT status, archived_by FROM volunteer WHERE id = $1`,
      [ion.volunteerId],
    );
    expect(ionVolunteer).toEqual({ status: 'active', archived_by: null });

    await as(elena.token)
      .delete(`/mobile/organization/${elena.volunteerId}`)
      .expect(200);
  });

  describe('volunteer profile (B5)', () => {
    it("cannot read another volunteer's profile or stats; own has no NGO notes", async () => {
      const e = as(elena.token);
      await e.get(`/mobile/volunteer/${ion.volunteerId}`).expect(404);
      await e
        .get(`/mobile/volunteer/${ion.volunteerId}/organization`)
        .expect(404);
      await e
        .patch(`/mobile/volunteer/${ion.volunteerId}/profile`)
        .send({ email: 'x@example.ro' })
        .expect(404);

      const own = await e.get(`/mobile/volunteer/${elena.volunteerId}`);
      expect(own.status).toBe(200);
      expect(own.body).toEqual(
        expect.objectContaining({
          id: elena.volunteerId,
          status: 'active',
          organization: expect.objectContaining({ id: orgA }),
          profile: expect.objectContaining({ email: 'elena@example.ro' }),
          user: expect.objectContaining({ id: elena.userId }),
        }),
      );
      for (const field of [
        'notes',
        'source',
        'isFavorite',
        'archivedBy',
        'blockedBy',
      ]) {
        expect(own.body).not.toHaveProperty(field);
      }
      await e
        .get(`/mobile/volunteer/${elena.volunteerId}/organization`)
        .expect(200);
    });
  });

  it("cannot change another user's notification settings", async () => {
    const [{ notifications_settings_id: ionSettings }] = await q(
      `SELECT notifications_settings_id FROM "user" WHERE id = $1`,
      [ion.userId],
    );
    const [{ notifications_settings_id: elenaSettings }] = await q(
      `SELECT notifications_settings_id FROM "user" WHERE id = $1`,
      [elena.userId],
    );

    await as(elena.token)
      .patch(`/mobile/settings/${ionSettings}`)
      .send({ notificationsViaPush: true })
      .expect(404);
    const [still] = await q(
      `SELECT notifications_via_push FROM notifications_settings WHERE id = $1`,
      [ionSettings],
    );
    expect(still.notifications_via_push).toBe(false);

    await as(elena.token)
      .patch(`/mobile/settings/${elenaSettings}`)
      .send({ notificationsViaPush: true })
      .expect(200);
  });

  describe('push tokens', () => {
    const tokens = async (): Promise<string[]> =>
      (await q(`SELECT token FROM push_tokens ORDER BY token`)).map(
        (r) => r.token,
      );

    it("cannot unregister another user's device token", async () => {
      await as(ion.token)
        .post('/mobile/push-notifications/register')
        .send({ token: 'ExponentPushToken[ion]' })
        .expect(201);

      await as(elena.token)
        .patch('/mobile/push-notifications/unregister')
        .send({ token: 'ExponentPushToken[ion]' })
        .expect(200);
      expect(await tokens()).toEqual(['ExponentPushToken[ion]']);

      await as(ion.token)
        .patch('/mobile/push-notifications/unregister')
        .send({ token: 'ExponentPushToken[ion]' })
        .expect(200);
      expect(await tokens()).toEqual([]);
    });

    it("logout removes the device's push token, only the user's own", async () => {
      const sessions = testApp.app.get(SessionService);
      const elenaIdentity = await testApp.app
        .get(AuthIdentityFacade)
        .findIdentity({ userId: elena.userId });
      const { refreshToken } = await sessions.createSession(
        elenaIdentity,
        AuthRealm.MOBILE,
      );
      await as(elena.token)
        .post('/mobile/push-notifications/register')
        .send({ token: 'ExponentPushToken[elena]' })
        .expect(201);
      await as(ion.token)
        .post('/mobile/push-notifications/register')
        .send({ token: 'ExponentPushToken[ion]' })
        .expect(201);

      // Ion's token with Elena's session stays
      await request(testApp.app.getHttpServer())
        .post('/mobile/auth/logout')
        .send({ refreshToken, pushToken: 'ExponentPushToken[ion]' })
        .expect(204);
      expect(await tokens()).toEqual([
        'ExponentPushToken[elena]',
        'ExponentPushToken[ion]',
      ]);

      const second = await sessions.createSession(
        elenaIdentity,
        AuthRealm.MOBILE,
      );
      await request(testApp.app.getHttpServer())
        .post('/mobile/auth/logout')
        .send({
          refreshToken: second.refreshToken,
          pushToken: 'ExponentPushToken[elena]',
        })
        .expect(204);
      expect(await tokens()).toEqual(['ExponentPushToken[ion]']);

      // an unknown refresh token removes nothing
      await request(testApp.app.getHttpServer())
        .post('/mobile/auth/logout')
        .send({ refreshToken: 'nope', pushToken: 'ExponentPushToken[ion]' })
        .expect(204);
      expect(await tokens()).toEqual(['ExponentPushToken[ion]']);
    });
  });

  describe('event details (M6)', () => {
    it('hides drafts, private events of other NGOs and events of NGOs that blocked the volunteer', async () => {
      const e = as(elena.token);
      const draft = await insertEvent(orgA, { status: 'draft' });
      const privateOther = await insertEvent(orgB);
      const publicOther = await insertEvent(orgB, { isPublic: true });
      const privateOwn = await insertEvent(orgA);

      await e.get(`/mobile/event/${draft}`).expect(404);
      await e.get(`/mobile/event/${privateOther}`).expect(404);

      const pub = await e.get(`/mobile/event/${publicOther}`).expect(200);
      expect(pub.body.organizationId).toBe(orgB);
      const own = await e.get(`/mobile/event/${privateOwn}`).expect(200);
      expect(own.body.organizationId).toBe(orgA);

      await q(
        `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'blocked')`,
        [elena.userId, orgB],
      );
      await e.get(`/mobile/event/${publicOther}`).expect(404);
    });

    it('hides a private event targeted at another department', async () => {
      const [admin] = await q(
        `SELECT id FROM "user" WHERE email = 'ana@crucea.ro'`,
      );
      const [{ id: other }] = await q(
        `INSERT INTO organization_structure (name, type, organization_id, created_by) VALUES ('Medical', 'department', $1, $2) RETURNING id`,
        [orgA, admin.id],
      );
      const event = await insertEvent(orgA);
      await q(
        `INSERT INTO event_targets_organization_structure ("eventId", "organizationStructureId") VALUES ($1, $2)`,
        [event, other],
      );

      await as(elena.token).get(`/mobile/event/${event}`).expect(404);
    });
  });

  describe('announcements (M14)', () => {
    const insertAnnouncement = async (
      organizationId: string,
    ): Promise<void> => {
      await q(
        `INSERT INTO announcement (name, description, status, organization_id, display_start_date, published_on)
         VALUES ('Anunț', 'd', 'active', $1, now() - interval '1 day', now()) RETURNING id`,
        [organizationId],
      );
    };

    it('only active volunteers see them, with the organization and dates', async () => {
      await insertAnnouncement(orgA);

      const res = await as(elena.token).get('/mobile/anouncement').expect(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0]).toEqual(
        expect.objectContaining({
          organization: { id: orgA, name: 'Crucea Verde', logo: 'logo-a.png' },
          createdOn: expect.any(String),
          publishedOn: expect.any(String),
        }),
      );

      for (const status of ['candidate', 'blocked', 'inactive']) {
        await q(`UPDATE volunteer SET status = $1 WHERE id = $2`, [
          status,
          ion.volunteerId,
        ]);
        const hidden = await as(ion.token)
          .get('/mobile/anouncement')
          .expect(200);
        expect(hidden.body.items).toEqual([]);
      }
    });
  });

  it('organization data (activity types, structure) only for the NGOs the user volunteers in', async () => {
    const e = as(elena.token);
    await q(
      `INSERT INTO activity_type (name, icon, status, organization_id) VALUES ('Sortare', 'box', 'active', $1)`,
      [orgB],
    );
    expect(
      (await e.get(`/mobile/activity-type/${orgB}`).expect(200)).body,
    ).toEqual([]);
    expect(
      (
        await e
          .get(`/mobile/organization-structure/department/organization/${orgB}`)
          .expect(200)
      ).body,
    ).toEqual([]);
    expect(
      (
        await e
          .get(`/mobile/organization-structure/department/organization/${orgA}`)
          .expect(200)
      ).body,
    ).toHaveLength(1);
  });

  it('a login without a profile cannot use endpoints acting on someone (USER_001)', async () => {
    const stub = await testApp.mintAccessToken(
      await identity('new@example.ro'),
      AuthRealm.MOBILE,
    );
    const s = as(stub);

    for (const call of [
      s.get(`/mobile/contract/history`),
      s.get(`/mobile/activity-log/counters`),
      s.get(`/mobile/volunteer/${elena.volunteerId}`),
      s.get(`/mobile/anouncement`),
      s.patch('/mobile/push-notifications/unregister').send({ token: 'x' }),
    ]) {
      const res = await call;
      expect(res.status).toBe(404);
      expect(res.body.code_error).toBe('USER_001');
    }
  });
});
