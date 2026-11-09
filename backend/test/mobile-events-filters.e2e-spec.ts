import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// Redesigned mobile events search: Organizație and Când filters, the organization on each card
// and whether the volunteer is going.
describe('Mobile events filters (e2e)', () => {
  let testApp: TestApp;
  let elena: IAuthIdentityModel;
  let userId: string;
  const orgs: Record<string, string> = {};

  const list = async (
    query: Record<string, string>,
  ): Promise<{
    items: {
      name: string;
      organizationId: string;
      organizationName: string;
      isGoing: boolean;
    }[];
    meta: { totalItems: number };
  }> =>
    (
      await request(testApp.app.getHttpServer())
        .get('/mobile/event')
        .query({ eventFilter: 'OPEN', limit: 50, ...query })
        .set(
          'Authorization',
          `Bearer ${await testApp.mintAccessToken(elena, AuthRealm.MOBILE)}`,
        )
        .expect(200)
    ).body;

  const names = (body: { items: { name: string }[] }): string[] =>
    body.items.map((item) => item.name).sort();

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
      'event',
      'volunteer',
      'user',
      'organization',
    ]);
    for (const name of ['Crucea', 'Salvati']) {
      const [org] = await testApp.dataSource.query(
        `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ($1, $2, $3, 'active', now()) RETURNING id`,
        [name, `contact@${name}.ro`, `+4070000${name.length}000`],
      );
      orgs[name] = org.id;
    }
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone) VALUES ('regular', 'Elena Pop', 'elena@example.ro', '+40722000000') RETURNING id`,
    );
    userId = user.id;
    await testApp.dataSource.query(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active'), ($1, $3, 'active')`,
      [userId, orgs.Crucea, orgs.Salvati],
    );
    elena = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'elena@example.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId,
    });

    const event = async (
      name: string,
      org: string,
      start: string,
    ): Promise<string> =>
      (
        await testApp.dataSource.query(
          `INSERT INTO event (name, description, start_date, end_date, status, organization_id)
           VALUES ($1, 'd', $2::timestamptz, $2::timestamptz + interval '2 hours', 'published', $3) RETURNING id`,
          [name, start, org],
        )
      )[0].id;
    const maraton = await event('Maraton', orgs.Crucea, '2030-05-10T09:00:00Z');
    await event('Curățenie', orgs.Crucea, '2030-05-20T09:00:00Z');
    await event('Concert', orgs.Salvati, '2030-05-20T18:00:00Z');
    await event('Gală', orgs.Salvati, '2030-06-01T18:00:00Z');
    await testApp.dataSource.query(
      `INSERT INTO event_rsvp (going, status, event_id, user_id) VALUES (true, 'approved', $1, $2)`,
      [maraton, userId],
    );
  });

  it('gives each card its organization and whether the volunteer is going', async () => {
    const body = await list({});
    expect(body.meta.totalItems).toBe(4);
    expect(body.items.find((item) => item.name === 'Maraton')).toEqual(
      expect.objectContaining({
        organizationId: orgs.Crucea,
        organizationName: 'Crucea',
        isGoing: true,
      }),
    );
    expect(body.items.find((item) => item.name === 'Gală')).toEqual(
      expect.objectContaining({ organizationName: 'Salvati', isGoing: false }),
    );
  });

  it('filters by organization and start date, together with search', async () => {
    expect(names(await list({ organizationId: orgs.Salvati }))).toEqual([
      'Concert',
      'Gală',
    ]);
    // a date with no time as the end means the whole day
    const may20 = await list({
      startFrom: '2030-05-20',
      startTo: '2030-05-20',
    });
    expect(names(may20)).toEqual(['Concert', 'Curățenie']);
    expect(may20.meta.totalItems).toBe(2);
    expect(
      names(
        await list({
          organizationId: orgs.Crucea,
          startFrom: '2030-05-15',
          search: 'Cur',
        }),
      ),
    ).toEqual(['Curățenie']);
    // the GOING list takes the filters too
    expect(
      names(await list({ eventFilter: 'GOING', organizationId: orgs.Salvati })),
    ).toEqual([]);
  });

  it('refuses a malformed organization or date', async () => {
    await request(testApp.app.getHttpServer())
      .get('/mobile/event')
      .query({ organizationId: 'nope', startFrom: 'not-a-date' })
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(elena, AuthRealm.MOBILE)}`,
      )
      .expect(400);
  });
});
