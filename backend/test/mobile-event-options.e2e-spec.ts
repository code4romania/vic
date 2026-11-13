import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// The event picker of „Adaugă ore” (GET /mobile/event/organization/:id): id and name as before,
// plus the start date shown on the right of each menu row.
describe('Mobile event options (e2e)', () => {
  let testApp: TestApp;
  let elena: IAuthIdentityModel;
  let orgId: string;

  const options = async (
    organizationId: string,
  ): Promise<{ id: string; name: string; startDate: string }[]> =>
    (
      await request(testApp.app.getHttpServer())
        .get(`/mobile/event/organization/${organizationId}`)
        .set(
          'Authorization',
          `Bearer ${await testApp.mintAccessToken(elena, AuthRealm.MOBILE)}`,
        )
        .expect(200)
    ).body;

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
      'volunteer',
      'user',
      'organization',
    ]);
    const [org] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ('Crucea', 'contact@crucea.ro', '+40700000000', 'active', now()) RETURNING id`,
    );
    orgId = org.id;
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone) VALUES ('regular', 'Elena Pop', 'elena@example.ro', '+40722000000') RETURNING id`,
    );
    await testApp.dataSource.query(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active')`,
      [user.id, orgId],
    );
    elena = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'elena@example.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: user.id,
    });
    await testApp.dataSource.query(
      `INSERT INTO event (name, description, start_date, end_date, status, organization_id) VALUES
         ('Atelier Comunicare', 'd', '2025-11-13T09:00:00Z', '2025-11-13T12:00:00Z', 'published', $1),
         ('Viitor', 'd', now() + interval '30 days', now() + interval '31 days', 'published', $1),
         ('Ciornă', 'd', '2025-11-01T09:00:00Z', NULL, 'draft', $1)`,
      [orgId],
    );
  });

  it('lists the started published events with their start date', async () => {
    const body = await options(orgId);
    expect(body).toEqual([
      {
        id: expect.any(String),
        name: 'Atelier Comunicare',
        startDate: '2025-11-13T09:00:00.000Z',
      },
    ]);
  });

  it('stays empty for an organization the user does not volunteer in', async () => {
    const [other] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ('Alta', 'contact@alta.ro', '+40700000001', 'active', now()) RETURNING id`,
    );
    expect(await options(other.id)).toEqual([]);
  });
});
