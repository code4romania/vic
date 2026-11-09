import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #475: the volunteers list carries the approved hours in the organization, the status and the source.
describe('Volunteers list columns (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  let organizationId: string;

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  const addVolunteer = async (
    name: string,
    status: string,
    source: string | null,
    orgId = organizationId,
  ): Promise<string> => {
    const [first, last] = name.split(' ');
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, first_name, last_name, email, phone)
       VALUES ('regular', $1, $2, $3, $4, '+40722000000') RETURNING id`,
      [name, first, last, `${name.replace(' ', '.').toLowerCase()}@example.ro`],
    );
    const [volunteer] = await testApp.dataSource.query(
      `INSERT INTO volunteer (user_id, organization_id, status, source) VALUES ($1, $2, $3, $4) RETURNING id`,
      [user.id, orgId, status, source],
    );
    return volunteer.id;
  };

  const log = (
    volunteerId: string,
    hours: number,
    status: string,
    orgId = organizationId,
  ): Promise<unknown> =>
    testApp.dataSource.query(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id) VALUES (now(), $1, $2, $3, $4)`,
      [hours, status, volunteerId, orgId],
    );

  const list = async (
    status: string,
  ): Promise<
    {
      user: { name: string };
      totalHours: number;
      status: string;
      source: string | null;
    }[]
  > => {
    const token = await testApp.mintAccessToken(admin, AuthRealm.WEB);
    const response = await http()
      .get('/volunteer')
      .query({ status, limit: 50, page: 1 })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    return response.body.items as {
      user: { name: string };
      totalHours: number;
      status: string;
      source: string | null;
    }[];
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
      'activity_log',
      'volunteer',
      'user',
      'organization',
    ]);
    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone) VALUES ('Org', 'org@example.ro', '+40700000000') RETURNING id`,
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
  });

  it('sums only approved hours, per volunteer and per organization', async () => {
    const elena = await addVolunteer('Elena Pop', 'active', 'Facebook');
    await addVolunteer('Ion Pop', 'active', null);
    await log(elena, 3, 'approved');
    await log(elena, 4, 'approved');
    await log(elena, 10, 'pending');
    await log(elena, 20, 'rejected');
    // the same person's hours in another NGO do not count
    const [other] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone) VALUES ('Alt ONG', 'alt@example.ro', '+40700000009') RETURNING id`,
    );
    const elsewhere = await addVolunteer(
      'Elena Altundeva',
      'active',
      null,
      other.id,
    );
    await log(elsewhere, 50, 'approved', other.id);

    const items = await list('active');

    expect(
      items.map((v) => [v.user.name, v.totalHours, v.status, v.source]).sort(),
    ).toEqual([
      ['Elena Pop', 7, 'active', 'Facebook'],
      ['Ion Pop', 0, 'active', null],
    ]);
  });

  it('lists candidates (no location, no profile) and exports them', async () => {
    await addVolunteer('Mara Nou', 'candidate', 'Târg ONG');
    expect((await list('candidate')).map((v) => v.totalHours)).toEqual([0]);

    const token = await testApp.mintAccessToken(admin, AuthRealm.WEB);
    await http()
      .get('/volunteer/download')
      .query({ status: 'candidate' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
