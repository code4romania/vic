import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #474: the volunteers search matches name, email and city, ignoring case and diacritics.
describe('Volunteers search (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  const addVolunteer = async (
    organizationId: string,
    name: string,
    email: string,
    cityId: number,
  ): Promise<void> => {
    const [first, last] = name.split(' ');
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, first_name, last_name, email, phone, location_id)
       VALUES ('regular', $1, $2, $3, $4, '+40722000000', $5) RETURNING id`,
      [name, first, last, email, cityId],
    );
    const [profile] = await testApp.dataSource.query(
      `INSERT INTO volunteer_profile (email) VALUES ($1) RETURNING id`,
      [email],
    );
    await testApp.dataSource.query(
      `INSERT INTO volunteer (user_id, organization_id, volunteer_profile_id, status) VALUES ($1, $2, $3, 'active')`,
      [user.id, organizationId, profile.id],
    );
  };

  const search = async (term: string): Promise<string[]> => {
    const token = await testApp.mintAccessToken(admin, AuthRealm.WEB);
    const response = await http()
      .get('/volunteer')
      .query({ status: 'active', search: term, limit: 50, page: 1 })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    return response.body.items
      .map((v: { user: { name: string } }) => v.user.name)
      .sort();
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
      'volunteer',
      'volunteer_profile',
      'user',
      'organization',
      '_city',
      '_county',
    ]);
    await testApp.dataSource.query(
      `INSERT INTO _county (id, name, abbreviation) VALUES (1, 'Brașov', 'BV'), (2, 'Iași', 'IS')`,
    );
    await testApp.dataSource.query(
      `INSERT INTO _city (id, name, county_id) VALUES (10, 'Brașov', 1), (20, 'Iași', 2), (21, 'Pașcani', 2)`,
    );
    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone) VALUES ('Org', 'org@example.ro', '+40700000000') RETURNING id`,
    );
    const [adminUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana Admin', 'ana@example.ro', '+40711111111', $1) RETURNING id`,
      [organization.id],
    );
    admin = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.WEB,
      email: 'ana@example.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: adminUser.id,
    });
    await addVolunteer(
      organization.id,
      'Ștefan Țurcanu',
      'stefan@example.ro',
      20,
    );
    await addVolunteer(
      organization.id,
      'Maria Pop',
      'maria.pop@example.ro',
      10,
    );
    await addVolunteer(organization.id, 'Ion Brasoveanu', 'ion@example.ro', 21);
  });

  it('matches the city, without diacritics and in any case', async () => {
    expect(await search('IASI')).toEqual(['Ștefan Țurcanu']);
    expect(await search('pascani')).toEqual(['Ion Brasoveanu']);
  });

  it('matches the name without diacritics, and diacritics typed for a plain name', async () => {
    expect(await search('stefan turcanu')).toEqual(['Ștefan Țurcanu']);
    expect(await search('brașov')).toEqual(['Ion Brasoveanu', 'Maria Pop']);
  });

  it('matches the email', async () => {
    expect(await search('MARIA.POP@')).toEqual(['Maria Pop']);
  });

  it('treats % and _ as plain characters', async () => {
    expect(await search('%')).toEqual([]);
    expect(await search('_')).toEqual([]);
  });
});
