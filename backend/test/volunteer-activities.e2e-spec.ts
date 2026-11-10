import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

type Item = {
  hours: number;
  status: string;
  event?: { name: string } | null;
  activityType?: { name: string } | null;
};

// #481: an activity is hours logged on an activity type with no event. The web lists the volunteer's
// activities in every status, and the app shows them in the hours history like event hours.
describe('Volunteer activities (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  let volunteerIdentity: IAuthIdentityModel;
  let organizationId: string;
  let volunteerId: string;
  let activityTypeId: string;
  let eventId: string;

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  const log = (
    hours: number,
    status: string,
    withEvent: boolean,
  ): Promise<unknown> =>
    testApp.dataSource.query(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id, activity_type_id, event_id)
       VALUES (now(), $1, $2, $3, $4, $5, $6)`,
      [
        hours,
        status,
        volunteerId,
        organizationId,
        activityTypeId,
        withEvent ? eventId : null,
      ],
    );

  const webList = async (query: Record<string, string>): Promise<Item[]> => {
    const token = await testApp.mintAccessToken(admin, AuthRealm.WEB);
    const response = await http()
      .get('/activity-log')
      .query({ volunteerId, limit: 50, page: 1, ...query })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    return response.body.items as Item[];
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
      'activity_type',
      'event',
      'volunteer',
      'volunteer_profile',
      'user',
      'notifications_settings',
      'organization',
    ]);
    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ('Org', 'org@example.ro', '+40700000000', 'active', now()) RETURNING id`,
    );
    organizationId = organization.id;
    const [adminUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana Admin', 'ana@example.ro', '+40711111111', $1) RETURNING id`,
      [organizationId],
    );
    admin = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.WEB,
      email: 'ana@example.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: adminUser.id,
    });

    const [settings] = await testApp.dataSource.query(
      `INSERT INTO notifications_settings (notifications_via_email, notifications_via_push) VALUES (false, false) RETURNING id`,
    );
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, first_name, last_name, email, phone, notifications_settings_id, active_organization_id)
       VALUES ('regular', 'Elena Pop', 'Elena', 'Pop', 'elena@example.ro', '+40722000000', $1, $2) RETURNING id`,
      [settings.id, organizationId],
    );
    const [profile] = await testApp.dataSource.query(
      `INSERT INTO volunteer_profile (email, active_since) VALUES ('elena@example.ro', now()) RETURNING id`,
    );
    const [volunteer] = await testApp.dataSource.query(
      `INSERT INTO volunteer (user_id, organization_id, status, volunteer_profile_id) VALUES ($1, $2, 'active', $3) RETURNING id`,
      [user.id, organizationId, profile.id],
    );
    volunteerId = volunteer.id;
    volunteerIdentity = await testApp.app
      .get(AuthIdentityFacade)
      .createIdentity({
        realm: AuthRealm.MOBILE,
        email: 'elena@example.ro',
        status: AuthIdentityStatus.ACTIVE,
        userId: user.id,
      });

    const [type] = await testApp.dataSource.query(
      `INSERT INTO activity_type (name, icon, organization_id) VALUES ('Strângere de fonduri', 'package', $1) RETURNING id`,
      [organizationId],
    );
    activityTypeId = type.id;
    const [event] = await testApp.dataSource.query(
      `INSERT INTO event (name, description, start_date, organization_id) VALUES ('Maraton', 'd', now(), $1) RETURNING id`,
      [organizationId],
    );
    eventId = event.id;
  });

  it('lets the NGO add an activity with no event; it is approved', async () => {
    const token = await testApp.mintAccessToken(admin, AuthRealm.WEB);
    await http()
      .post('/activity-log')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-11-01', hours: 5, volunteerId, activityTypeId })
      .expect(201);

    const items = await webList({ source: 'activity' });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      hours: 5,
      status: 'approved',
      event: null,
      activityType: { name: 'Strângere de fonduri' },
    });
  });

  it('lists activities in every status and keeps event hours apart', async () => {
    await log(1, 'pending', false);
    await log(2, 'approved', false);
    await log(3, 'rejected', false);
    await log(10, 'approved', true);

    const activities = await webList({ source: 'activity' });
    expect(activities.map((i) => i.hours).sort((a, b) => a - b)).toEqual([
      1, 2, 3,
    ]);

    const events = await webList({ source: 'event' });
    expect(events.map((i) => i.hours)).toEqual([10]);

    // the existing tabs still filter by resolution status
    const solved = await webList({ resolutionStatus: 'solved' });
    expect(solved.map((i) => i.hours).sort((a, b) => a - b)).toEqual([
      2, 3, 10,
    ]);
  });

  it('shows activity hours in the app history like event hours', async () => {
    await log(2, 'approved', false);
    await log(10, 'approved', true);

    const token = await testApp.mintAccessToken(
      volunteerIdentity,
      AuthRealm.MOBILE,
    );
    const response = await http()
      .get('/mobile/activity-log')
      .query({ resolutionStatus: 'solved', limit: 50, page: 1 })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const items = response.body.items as Item[];
    expect(items.map((i) => i.hours).sort((a, b) => a - b)).toEqual([2, 10]);
    expect(items.find((i) => i.hours === 2)?.activityType?.name).toBe(
      'Strângere de fonduri',
    );
  });

  // #483: the NGO adds hours by hand (optional event); they are approved. Only an Active volunteer can get hours.
  it('adds approved hours on an event, with a description', async () => {
    const token = await testApp.mintAccessToken(admin, AuthRealm.WEB);
    await http()
      .post('/activity-log')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-11-02',
        hours: 3,
        volunteerId,
        eventId,
        mentions: 'Punct de hidratare',
      })
      .expect(201);

    const items = await webList({ source: 'event' });
    expect(items).toMatchObject([
      { hours: 3, status: 'approved', event: { name: 'Maraton' } },
    ]);
  });

  it.each(['blocked', 'inactive', 'candidate'])(
    'refuses hours for a %s volunteer: 400 ACTIVITY_LOG_005',
    async (status) => {
      await testApp.dataSource.query(
        `UPDATE volunteer SET status = $1 WHERE id = $2`,
        [status, volunteerId],
      );
      const token = await testApp.mintAccessToken(admin, AuthRealm.WEB);
      const response = await http()
        .post('/activity-log')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2026-11-02', hours: 3, volunteerId })
        .expect(400);
      expect(response.body.code_error).toBe('ACTIVITY_LOG_005');
      expect(await webList({})).toEqual([]);
    },
  );

  // #593: a rejection needs a reason; the decision reaches the volunteer by email too, when it is on
  describe('decisions on pending hours', () => {
    let logId: string;

    const decide = async (
      decision: 'approve' | 'reject',
      body: Record<string, unknown> = {},
    ): Promise<request.Response> =>
      http()
        .patch(`/activity-log/${logId}/${decision}`)
        .set(
          'Authorization',
          `Bearer ${await testApp.mintAccessToken(admin, AuthRealm.WEB)}`,
        )
        .send(body);

    const emailOn = (on: boolean): Promise<unknown> =>
      testApp.dataSource.query(
        `UPDATE notifications_settings SET notifications_via_email = $1`,
        [on],
      );

    const eventually = async (check: () => boolean): Promise<void> => {
      for (let i = 0; i < 50 && !check(); i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    };

    beforeEach(async () => {
      testApp.mailbox.clear();
      const [row] = await testApp.dataSource.query(
        `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id, activity_type_id)
         VALUES ('2026-11-03', 4, 'pending', $1, $2, $3) RETURNING id`,
        [volunteerId, organizationId, activityTypeId],
      );
      logId = row.id;
    });

    it.each([{}, { rejectionReason: '' }, { rejectionReason: '   ' }])(
      'refuses to reject without a reason (%j): 400 ACTIVITY_LOG_006',
      async (body) => {
        const response = await decide('reject', body);
        expect(response.status).toBe(400);
        expect(response.body.code_error).toBe('ACTIVITY_LOG_006');
        expect((await webList({}))[0].status).toBe('pending');
      },
    );

    it('emails the rejection and its reason when email is on', async () => {
      await emailOn(true);
      await decide('reject', {
        rejectionReason: '  Nu ai fost la eveniment  ',
      }).then((response) => expect(response.status).toBe(200));

      await eventually(() => !!testApp.mailbox.last('elena@example.ro'));
      const email = testApp.mailbox.last('elena@example.ro');
      expect(email.subject).toBe(
        'Orele tale de voluntariat la Org au fost respinse',
      );
      expect(email.context.subtitle).toBe(
        '4 ore de voluntariat din 03/11/2026 au fost respinse. Motiv: Nu ai fost la eveniment',
      );
    });

    it('emails the approval when email is on', async () => {
      await emailOn(true);
      await decide('approve').then((response) =>
        expect(response.status).toBe(200),
      );

      await eventually(() => !!testApp.mailbox.last('elena@example.ro'));
      expect(testApp.mailbox.last('elena@example.ro').subject).toBe(
        'Orele tale de voluntariat la Org au fost aprobate',
      );
    });

    it('sends no email when the volunteer turned email off', async () => {
      await decide('approve').then((response) =>
        expect(response.status).toBe(200),
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(testApp.mailbox.to('elena@example.ro')).toEqual([]);
    });
  });
});
