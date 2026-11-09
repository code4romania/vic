import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// Redesigned mobile Profil: approved hours, events and years in VIC, across organizations.
describe('Mobile personal statistics (e2e)', () => {
  let testApp: TestApp;
  let elena: IAuthIdentityModel;
  let userId: string;
  const orgs: string[] = [];

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
      'user',
      'organization',
    ]);
    orgs.length = 0;
    for (const name of ['crucea', 'salvati']) {
      const [org] = await testApp.dataSource.query(
        `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ($1, $2, $3, 'active', now()) RETURNING id`,
        [name, `contact@${name}.ro`, `+4070000${name.length}000`],
      );
      orgs.push(org.id);
    }
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, created_on)
       VALUES ('regular', 'Elena Pop', 'elena@example.ro', '+40722000000', now() - interval '2 years 3 months')
       RETURNING id`,
    );
    userId = user.id;
    elena = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'elena@example.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId,
    });
  });

  const me = async (): Promise<{
    approvedHours: number;
    events: number;
    memberSince: string;
    yearsInVic: number;
  }> =>
    (
      await request(testApp.app.getHttpServer())
        .get('/mobile/statistics/me')
        .set(
          'Authorization',
          `Bearer ${await testApp.mintAccessToken(elena, AuthRealm.MOBILE)}`,
        )
        .expect(200)
    ).body;

  it('adds up approved hours and approved event registrations in every organization', async () => {
    const volunteers: string[] = [];
    for (const org of orgs) {
      const [volunteer] = await testApp.dataSource.query(
        `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active') RETURNING id`,
        [userId, org],
      );
      volunteers.push(volunteer.id);
    }
    await testApp.dataSource.query(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id, deleted_on) VALUES
         (now(), 3, 'approved', $1, $3, NULL), (now(), 5, 'approved', $2, $4, NULL),
         (now(), 7, 'pending', $1, $3, NULL), (now(), 9, 'approved', $1, $3, now())`,
      [volunteers[0], volunteers[1], orgs[0], orgs[1]],
    );
    const event = async (org: string, status = 'published'): Promise<string> =>
      (
        await testApp.dataSource.query(
          `INSERT INTO event (name, description, start_date, status, organization_id) VALUES ('E', 'd', now(), $1, $2) RETURNING id`,
          [status, org],
        )
      )[0].id;
    const counted = [await event(orgs[0]), await event(orgs[1], 'archived')];
    const pending = await event(orgs[0]);
    const rejected = await event(orgs[1]);
    const draft = await event(orgs[0], 'draft');
    await testApp.dataSource.query(
      `INSERT INTO event_rsvp (going, status, event_id, user_id) VALUES
         (true, 'approved', $1, $6), (true, 'approved', $2, $6), (true, 'pending', $3, $6),
         (true, 'rejected', $4, $6), (true, 'approved', $5, $6)`,
      [...counted, pending, rejected, draft, userId],
    );

    const stats = await me();
    expect(stats).toEqual(
      expect.objectContaining({ approvedHours: 8, events: 2, yearsInVic: 2 }),
    );
    expect(new Date(stats.memberSince).getTime()).toBeLessThan(Date.now());
  });

  it('is all zeros for a new volunteer with no organization', async () => {
    await testApp.dataSource.query(
      `UPDATE "user" SET created_on = now() WHERE id = $1`,
      [userId],
    );
    expect(await me()).toEqual(
      expect.objectContaining({ approvedHours: 0, events: 0, yearsInVic: 0 }),
    );
  });
});
