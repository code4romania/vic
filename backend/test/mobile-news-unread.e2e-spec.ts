import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// The red badge on the mobile Home bell: the volunteer's "Noutăți" newer than the last time they
// opened the screen; opening it (POST /mobile/news/seen) reads them all.
describe('Mobile unread news (e2e)', () => {
  let testApp: TestApp;
  let elena: IAuthIdentityModel;
  let userId: string;
  let otherUserId: string;
  let adminId: string;
  let activeVolunteer: string;
  let inactiveVolunteer: string;
  let otherVolunteer: string;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  const token = async (): Promise<string> =>
    `Bearer ${await testApp.mintAccessToken(elena, AuthRealm.MOBILE)}`;

  const unread = async (): Promise<number> =>
    (
      await request(testApp.app.getHttpServer())
        .get('/mobile/news/unread-count')
        .set('Authorization', await token())
        .expect(200)
    ).body.unread;

  const news = async (
    eventName: string,
    eventData: Record<string, string>,
    createdOn = 'now()',
  ): Promise<void> => {
    await testApp.dataSource.query(
      `INSERT INTO actions_archive (event_name, event_data, author_id, created_on)
       VALUES ($1, $2, $3, ${createdOn})`,
      [eventName, JSON.stringify(eventData), adminId],
    );
  };

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'auth_identity',
      'actions_archive',
      'volunteer',
      'user',
      'organization',
    ]);
    const orgs: string[] = [];
    for (const name of ['crucea', 'salvati']) {
      const [org] = await testApp.dataSource.query(
        `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ($1, $2, $3, 'active', now()) RETURNING id`,
        [name, `contact@${name}.ro`, `+4070000${name.length}000`],
      );
      orgs.push(org.id);
    }
    [{ id: adminId }] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Admin', 'admin@crucea.ro', '+40711111111', $1) RETURNING id`,
      [orgs[0]],
    );
    [{ id: userId }] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, first_name, last_name, news_last_seen_at)
       VALUES ('regular', 'Elena Pop', 'elena@example.ro', '+40722000000', 'Elena', 'Pop', now() - interval '1 day')
       RETURNING id`,
    );
    [{ id: otherUserId }] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, first_name, last_name, news_last_seen_at)
       VALUES ('regular', 'Ion Pop', 'ion@example.ro', '+40722000001', 'Ion', 'Pop', now() - interval '1 day')
       RETURNING id`,
    );
    const volunteer = async (
      user: string,
      org: string,
      status: string,
    ): Promise<string> =>
      (
        await testApp.dataSource.query(
          `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, $3) RETURNING id`,
          [user, org, status],
        )
      )[0].id;
    activeVolunteer = await volunteer(userId, orgs[0], 'active');
    inactiveVolunteer = await volunteer(userId, orgs[1], 'inactive');
    otherVolunteer = await volunteer(otherUserId, orgs[0], 'active');
    elena = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'elena@example.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId,
    });
  });

  it('counts only the news the volunteer sees in Noutăți, newer than their last visit', async () => {
    // unread: hours, a contract and an approved access request, for Elena
    await news('CHANGE_ACTIVITY_LOG_STATUS', {
      volunteerId: activeVolunteer,
      newStatus: 'approved',
    });
    await news('CREATE_CONTRACT', { volunteerId: activeVolunteer });
    await news('APPROVE_ACCESS_REQUEST', { userId });
    // already seen: before her last visit
    await news(
      'CHANGE_ACTIVITY_LOG_STATUS',
      { volunteerId: activeVolunteer, newStatus: 'rejected' },
      `now() - interval '2 days'`,
    );
    // not hers, not shown in Noutăți, or about a profile that is not active
    await news('CREATE_CONTRACT', { volunteerId: otherVolunteer });
    await news('REJECT_ACCESS_REQUEST', { userId: otherUserId });
    await news('UPDATE_ACTIVITY_LOG', { volunteerId: activeVolunteer });
    await news('CREATE_CONTRACT', { volunteerId: inactiveVolunteer });

    expect(await unread()).toBe(3);
  });

  it('opening Noutăți reads everything; a newer update is unread again', async () => {
    await news('CREATE_CONTRACT', { volunteerId: activeVolunteer });
    await news('APPROVE_ACCESS_REQUEST', { userId });
    expect(await unread()).toBe(2);

    await request(testApp.app.getHttpServer())
      .post('/mobile/news/seen')
      .set('Authorization', await token())
      .expect(204);
    expect(await unread()).toBe(0);

    await news('CHANGE_ACTIVITY_LOG_STATUS', {
      volunteerId: activeVolunteer,
      newStatus: 'approved',
    });
    expect(await unread()).toBe(1);

    // another volunteer's read state is their own
    const [other] = await testApp.dataSource.query(
      `SELECT news_last_seen_at < now() - interval '12 hours' AS old FROM "user" WHERE id = $1`,
      [otherUserId],
    );
    expect(other.old).toBe(true);
  });

  it('a new account starts with nothing unread', async () => {
    await testApp.dataSource.query(
      `UPDATE "user" SET news_last_seen_at = DEFAULT WHERE id = $1`,
      [userId],
    );
    await news(
      'APPROVE_ACCESS_REQUEST',
      { userId },
      `now() - interval '1 minute'`,
    );
    expect(await unread()).toBe(0);
  });

  it('both routes need a mobile login', async () => {
    await request(testApp.app.getHttpServer())
      .get('/mobile/news/unread-count')
      .expect(401);
    await request(testApp.app.getHttpServer())
      .post('/mobile/news/seen')
      .expect(401);
  });
});
