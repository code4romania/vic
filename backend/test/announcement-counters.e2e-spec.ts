import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #502: counters above the announcements list.
describe('Announcement counters (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  const orgs: string[] = [];
  const users: string[] = [];

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'auth_identity',
      'announcement_response',
      'announcement',
      'user',
      'organization',
    ]);
    orgs.length = 0;
    users.length = 0;
    for (const name of ['crucea', 'salvati']) {
      const [org] = await testApp.dataSource.query(
        `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ($1, $2, $3, 'active', now()) RETURNING id`,
        [name, `contact@${name}.ro`, `+4070000${name.length}000`],
      );
      orgs.push(org.id);
    }
    const [adminUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id) VALUES ('admin', 'Ana', 'ana@crucea.ro', '+40711111111', $1) RETURNING id`,
      [orgs[0]],
    );
    admin = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.WEB,
      email: 'ana@crucea.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: adminUser.id,
    });
    for (const n of [1, 2]) {
      const [user] = await testApp.dataSource.query(
        `INSERT INTO "user" (type, name, email, phone) VALUES ('regular', $1, $2, $3) RETURNING id`,
        [`Voluntar ${n}`, `v${n}@example.ro`, `+4072200000${n}`],
      );
      users.push(user.id);
    }
  });

  const announcement = async (
    org: string,
    status: string,
    deleted = false,
  ): Promise<string> =>
    (
      await testApp.dataSource.query(
        `INSERT INTO announcement (name, description, status, organization_id, display_start_date, deleted_on)
         VALUES ('A', 'd', $1, $2, now(), ${deleted ? 'now()' : 'NULL'}) RETURNING id`,
        [status, org],
      )
    )[0].id;

  it('counts announcements per status and their responses, in the admin organization', async () => {
    const [own, other] = orgs;
    const a1 = await announcement(own, 'active');
    await announcement(own, 'active');
    const a3 = await announcement(own, 'inactive');
    await announcement(own, 'archived');
    const deleted = await announcement(own, 'active', true);
    const elsewhere = await announcement(other, 'active');
    await testApp.dataSource.query(
      `INSERT INTO announcement_response (comment, announcement_id, user_id) VALUES
         ('da', $1, $5), ('vin', $1, $6), ('ok', $2, $5), ('x', $3, $5), ('y', $4, $5)`,
      [a1, a3, deleted, elsewhere, users[0], users[1]],
    );

    const { body } = await request(testApp.app.getHttpServer())
      .get('/announcement/counters')
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(admin, AuthRealm.WEB)}`,
      )
      .expect(200);

    expect(body).toEqual({ active: 2, inactive: 1, archived: 1, responses: 3 });
  });

  // #593: "Active" means seen in the app now; a scheduled or ended announcement is not counted
  it('counts as active only the announcements inside their display period', async () => {
    const [own] = orgs;
    await announcement(own, 'active');
    await testApp.dataSource.query(
      `INSERT INTO announcement (name, description, status, organization_id, display_start_date, display_end_date) VALUES
         ('Programat', 'd', 'active', $1, now() + interval '3 days', NULL),
         ('Încheiat', 'd', 'active', $1, now() - interval '5 days', now() - interval '1 day')`,
      [own],
    );

    const { body } = await request(testApp.app.getHttpServer())
      .get('/announcement/counters')
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(admin, AuthRealm.WEB)}`,
      )
      .expect(200);

    expect(body.active).toBe(1);
  });
});
