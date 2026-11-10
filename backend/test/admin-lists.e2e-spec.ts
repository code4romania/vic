import { GetVicStatisticsUsecase } from 'src/usecases/dashboard/get-vic-statistics.usecase';
import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #511: the super admin lists every organization and every volunteer account.
describe('Super admin lists (e2e)', () => {
  let testApp: TestApp;
  let superAdminToken: string;
  let adminToken: string;
  const orgs: Record<string, string> = {};

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'auth_identity',
      'volunteer',
      'user',
      'organization',
    ]);
    const facade = testApp.app.get(AuthIdentityFacade);
    let n = 0;
    for (const [name, status, taxId] of [
      ['VIC', 'active', 'RO1'],
      ['Crucea Verde', 'active', 'RO123456'],
      ['Salvați Pădurea', 'pending', 'RO999'],
      ['Ajutor_100%', 'suspended', null],
    ]) {
      n += 1;
      const [org] = await testApp.dataSource.query(
        `INSERT INTO organization (name, email, phone, status, tax_id, created_on)
         VALUES ($1, $2, $3, $4, $5, now() - ($6 || ' days')::interval) RETURNING id`,
        [name, `org${n}@test.ro`, `+4070000000${n}`, status, taxId, 10 - n],
      );
      orgs[name] = org.id;
    }
    const [superUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Super Admin', 'super@vic.ro', '+40710000001', $1) RETURNING id`,
      [orgs['VIC']],
    );
    superAdminToken = await testApp.mintAccessToken(
      await facade.createIdentity({
        realm: AuthRealm.WEB,
        email: 'super@vic.ro',
        status: AuthIdentityStatus.ACTIVE,
        superAdmin: true,
        userId: superUser.id,
      }),
      AuthRealm.WEB,
    );
    const [adminUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana', 'ana@crucea.ro', '+40710000002', $1) RETURNING id`,
      [orgs['Crucea Verde']],
    );
    adminToken = await testApp.mintAccessToken(
      await facade.createIdentity({
        realm: AuthRealm.WEB,
        email: 'ana@crucea.ro',
        status: AuthIdentityStatus.ACTIVE,
        userId: adminUser.id,
      }),
      AuthRealm.WEB,
    );
    // volunteers: Elena in two NGOs (one inactive), Mihai in one, a deleted account
    const users: Record<string, string> = {};
    for (const [name, email, deleted] of [
      ['Elena Pop', 'elena@example.ro', false],
      ['Mihai Ion', 'mihai@example.ro', false],
      ['Șters', 'sters@example.ro', true],
    ] as const) {
      n += 1;
      const [user] = await testApp.dataSource.query(
        `INSERT INTO "user" (type, name, email, phone, deleted_on)
         VALUES ('regular', $1, $2, $3, ${deleted ? 'now()' : 'NULL'}) RETURNING id`,
        [name, email, `+4072000000${n}`],
      );
      users[name] = user.id;
    }
    await testApp.dataSource.query(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES
         ($1, $3, 'active'), ($1, $4, 'active'), ($1, $5, 'inactive'), ($2, $3, 'active')`,
      [
        users['Elena Pop'],
        users['Mihai Ion'],
        orgs['Crucea Verde'],
        orgs['VIC'],
        orgs['Salvați Pădurea'],
      ],
    );
  });

  const get = (url: string, token = superAdminToken): request.Test =>
    request(testApp.app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${token}`);

  it('lists organizations newest first, paginated, with active volunteers', async () => {
    const { body } = await get('/admin/organizations?limit=2&page=1').expect(
      200,
    );
    expect(body.meta).toEqual({
      itemCount: 2,
      totalItems: 4,
      itemsPerPage: 2,
      totalPages: 2,
      currentPage: 1,
    });
    expect(
      body.items.map((o: { name: string; volunteers: number }) => o.name),
    ).toEqual(['Ajutor_100%', 'Salvați Pădurea']);
    const { body: page2 } = await get('/admin/organizations?limit=2&page=2');
    expect(
      page2.items.map((o: { name: string; volunteers: number }) => [
        o.name,
        o.volunteers,
      ]),
    ).toEqual([
      ['Crucea Verde', 2],
      ['VIC', 1],
    ]);
  });

  it('searches organizations by name or CUI and filters by status', async () => {
    const byTaxId = await get('/admin/organizations?search=123456');
    expect(
      byTaxId.body.items.map(
        (o: { name: string; volunteers: number }) => o.name,
      ),
    ).toEqual(['Crucea Verde']);
    // % and _ are literal, not wildcards
    const literal = await get('/admin/organizations?search=_100%25');
    expect(
      literal.body.items.map(
        (o: { name: string; volunteers: number }) => o.name,
      ),
    ).toEqual(['Ajutor_100%']);
    const pending = await get('/admin/organizations?status=pending');
    expect(
      pending.body.items.map(
        (o: { name: string; volunteers: number }) => o.name,
      ),
    ).toEqual(['Salvați Pădurea']);

    // awaiting validation: confirmed (active) and not validated yet
    await testApp.dataSource.query(
      `UPDATE organization SET validated_at = now() WHERE name = 'VIC'`,
    );
    const names = async (query: string): Promise<string[]> =>
      (await get(`/admin/organizations?${query}`)).body.items.map(
        (o: { name: string }) => o.name,
      );
    expect(await names('awaitingValidation=true')).toEqual(['Crucea Verde']);
    expect(await names('awaitingValidation=false')).toEqual(['VIC']);

    // the public figure in the app counts only the organizations volunteers can see
    const statistics = await testApp.app.get(GetVicStatisticsUsecase).execute();
    expect(statistics.numberOfOrganizations).toBe(1);
  });

  it('lists volunteer accounts with their active organizations, searchable', async () => {
    const { body } = await get('/admin/volunteers').expect(200);
    expect(body.meta.totalItems).toBe(2);
    const elena = body.items.find(
      (v: { name: string; organizations: string[] }) => v.name === 'Elena Pop',
    );
    expect(elena.organizations).toEqual(['Crucea Verde', 'VIC']);
    expect(elena.email).toBe('elena@example.ro');

    const { body: search } = await get('/admin/volunteers?search=MIHAI');
    expect(
      search.items.map((v: { name: string; organizations: string[] }) => [
        v.name,
        v.organizations,
      ]),
    ).toEqual([['Mihai Ion', ['Crucea Verde']]]);
  });

  it('is for super admins only', async () => {
    await get('/admin/organizations', adminToken).expect(403);
    await get('/admin/volunteers', adminToken).expect(403);
    await get('/admin/volunteers?limit=500').expect(400);
  });
});
