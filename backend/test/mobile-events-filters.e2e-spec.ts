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
      registrationStatus: string | null;
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
    const curatenie = await event(
      'Curățenie',
      orgs.Crucea,
      '2030-05-20T09:00:00Z',
    );
    const concert = await event(
      'Concert',
      orgs.Salvati,
      '2030-05-20T18:00:00Z',
    );
    await event('Gală', orgs.Salvati, '2030-06-01T18:00:00Z');
    await testApp.dataSource.query(
      `INSERT INTO event_rsvp (going, status, event_id, user_id) VALUES
         (true, 'approved', $1, $2), (true, 'rejected', $3, $2), (true, 'pending', $4, $2)`,
      [maraton, userId, curatenie, concert],
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
        registrationStatus: 'approved',
      }),
    );
    // a rejected registration is not "going"; a pending one is, with its status
    expect(body.items.find((item) => item.name === 'Curățenie')).toEqual(
      expect.objectContaining({
        isGoing: false,
        registrationStatus: 'rejected',
      }),
    );
    expect(body.items.find((item) => item.name === 'Concert')).toEqual(
      expect.objectContaining({ isGoing: true, registrationStatus: 'pending' }),
    );
    expect(body.items.find((item) => item.name === 'Gală')).toEqual(
      expect.objectContaining({
        organizationName: 'Salvati',
        isGoing: false,
        registrationStatus: null,
      }),
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
    // the GOING list takes the filters too, and leaves out rejected registrations
    expect(
      names(await list({ eventFilter: 'GOING', organizationId: orgs.Salvati })),
    ).toEqual(['Concert']);
    expect(
      names(await list({ eventFilter: 'GOING', organizationId: orgs.Crucea })),
    ).toEqual(['Maraton']);
  });

  it('reads a date with no time as the day in Romania', async () => {
    // 21 May 2030, 01:30 in Bucharest; still 20 May in UTC
    await testApp.dataSource.query(
      `INSERT INTO event (name, description, start_date, status, organization_id)
       VALUES ('Noaptea muzeelor', 'd', '2030-05-20T22:30:00Z', 'published', $1)`,
      [orgs.Crucea],
    );
    const day = async (d: string): Promise<string[]> =>
      names(
        await list({ organizationId: orgs.Crucea, startFrom: d, startTo: d }),
      );
    expect(await day('2030-05-20')).toEqual(['Curățenie']);
    expect(await day('2030-05-21')).toEqual(['Noaptea muzeelor']);
  });

  it('treats a request with no eventFilter as the open list', async () => {
    const { body } = await request(testApp.app.getHttpServer())
      .get('/mobile/event')
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(elena, AuthRealm.MOBILE)}`,
      )
      .expect(200);
    expect(body.meta.totalItems).toBe(4);
  });

  const counts = async (
    query: Record<string, string>,
  ): Promise<{ open: number; going: number; organizations: number }> =>
    (
      await request(testApp.app.getHttpServer())
        .get('/mobile/event/counts')
        .query(query)
        .set(
          'Authorization',
          `Bearer ${await testApp.mintAccessToken(elena, AuthRealm.MOBILE)}`,
        )
        .expect(200)
    ).body;

  it('counts each segment as many events as its list holds, with the same filters', async () => {
    // a public event of an organization Elena is not part of: open, but not in her organizations
    const [other] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ('Altii', 'contact@altii.ro', '+40700009000', 'active', now()) RETURNING id`,
    );
    await testApp.dataSource.query(
      `INSERT INTO event (name, description, start_date, status, is_public, organization_id)
       VALUES ('Maraton public', 'd', '2030-05-12T09:00:00Z', 'published', true, $1),
              ('Ciornă', 'd', '2030-05-12T09:00:00Z', 'draft', true, $1)`,
      [other.id],
    );

    const totals = async (
      query: Record<string, string>,
    ): Promise<Record<string, number>> => ({
      open: (await list({ ...query, eventFilter: 'OPEN' })).meta.totalItems,
      going: (await list({ ...query, eventFilter: 'GOING' })).meta.totalItems,
      organizations: (await list({ ...query, eventFilter: 'ORGANIZATIONS' }))
        .meta.totalItems,
    });

    expect(await counts({})).toEqual({ open: 5, going: 2, organizations: 4 });
    for (const query of [
      {},
      { search: 'Maraton' },
      { organizationId: orgs.Salvati },
      { startFrom: '2030-05-20', startTo: '2030-05-20' },
      { organizationId: orgs.Crucea, startFrom: '2030-05-15', search: 'Cur' },
      { search: 'nimic' },
    ]) {
      expect(await counts(query)).toEqual(await totals(query));
    }
    expect(await counts({ search: 'Maraton' })).toEqual({
      open: 2,
      going: 1,
      organizations: 1,
    });
  });

  it('follows a new registration in the Particip count', async () => {
    const [gala] = await testApp.dataSource.query(
      `SELECT id FROM event WHERE name = 'Gală'`,
    );
    expect((await counts({})).going).toBe(2);
    await testApp.dataSource.query(
      `INSERT INTO event_rsvp (going, status, event_id, user_id) VALUES (true, 'pending', $1, $2)`,
      [gala.id, userId],
    );
    expect((await counts({})).going).toBe(3);
  });

  it('refuses a malformed filter on the counts', async () => {
    await request(testApp.app.getHttpServer())
      .get('/mobile/event/counts')
      .query({ organizationId: 'nope' })
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(elena, AuthRealm.MOBILE)}`,
      )
      .expect(400);
    await request(testApp.app.getHttpServer())
      .get('/mobile/event/counts')
      .expect(401);
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
