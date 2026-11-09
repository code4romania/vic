import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number): Date => new Date(Date.now() + days * DAY);

// #495: the web's events tabs: upcoming (not started), ongoing (started, not ended) and finished.
describe('Events list tabs (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  let organizationId: string;

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  const addEvent = (
    name: string,
    startDate: Date,
    endDate: Date | null,
  ): Promise<unknown> =>
    testApp.dataSource.query(
      `INSERT INTO event (name, description, start_date, end_date, organization_id) VALUES ($1, 'd', $2, $3, $4)`,
      [name, startDate, endDate, organizationId],
    );

  const list = async (
    query: Record<string, string | number>,
  ): Promise<{ names: string[]; total: number }> => {
    const token = await testApp.mintAccessToken(admin, AuthRealm.WEB);
    const response = await http()
      .get('/event')
      .query({ limit: 50, page: 1, ...query })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    return {
      names: (response.body.items as { name: string }[])
        .map((e) => e.name)
        .sort(),
      total: response.body.meta.totalItems,
    };
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
      'event',
      'user',
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

    await addEvent('Viitor', daysFromNow(3), daysFromNow(4));
    await addEvent('Viitor fără sfârșit', daysFromNow(5), null);
    await addEvent('Acum', daysFromNow(-1), daysFromNow(1));
    await addEvent('Început fără sfârșit', daysFromNow(-10), null);
    await addEvent('Încheiat', daysFromNow(-5), daysFromNow(-4));
  });

  it('splits events by their start and end dates', async () => {
    expect((await list({ eventState: 'upcoming' })).names).toEqual([
      'Viitor',
      'Viitor fără sfârșit',
    ]);
    expect((await list({ eventState: 'ongoing' })).names).toEqual([
      'Acum',
      'Început fără sfârșit',
    ]);
    expect((await list({ eventState: 'past' })).names).toEqual(['Încheiat']);
    // "open" (the app and older links) is upcoming + ongoing
    expect((await list({ eventState: 'open' })).total).toBe(4);
  });

  it('paginates each tab on its own', async () => {
    const first = await list({ eventState: 'ongoing', limit: 1, page: 1 });
    const second = await list({ eventState: 'ongoing', limit: 1, page: 2 });
    expect(first.total).toBe(2);
    expect([...first.names, ...second.names].sort()).toEqual([
      'Acum',
      'Început fără sfârșit',
    ]);
  });
});
