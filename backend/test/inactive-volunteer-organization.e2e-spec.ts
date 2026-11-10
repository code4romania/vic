import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #589 (#472): a volunteer the NGO makes inactive keeps the NGO in the app, read-only; one who
// leaves by themselves does not.
describe('Inactive volunteer keeps the organization (e2e)', () => {
  let testApp: TestApp;
  let adminToken: string;
  let volunteerToken: string;
  let organizationId: string;
  let userId: string;
  let volunteerId: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (sql: string, params: unknown[] = []): Promise<any[]> =>
    testApp.dataSource.query(sql, params);

  const profile = (): request.Test =>
    request(testApp.app.getHttpServer())
      .get('/mobile/user/profile')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .expect(200);

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'actions_archive',
      'auth_identity',
      'volunteer',
      'volunteer_profile',
      'user',
      'notifications_settings',
      'organization',
    ]);
    [{ id: organizationId }] = await q(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Crucea Verde', 'org@crucea.ro', '+40700000001', 'active', now()) RETURNING id`,
    );
    const [admin] = await q(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana', 'ana@crucea.ro', '+40710000002', $1) RETURNING id`,
      [organizationId],
    );
    const facade = testApp.app.get(AuthIdentityFacade);
    adminToken = await testApp.mintAccessToken(
      await facade.createIdentity({
        realm: AuthRealm.WEB,
        email: 'ana@crucea.ro',
        status: AuthIdentityStatus.ACTIVE,
        userId: admin.id,
      }),
      AuthRealm.WEB,
    );
    const [settings] = await q(
      `INSERT INTO notifications_settings (notifications_via_email, notifications_via_push) VALUES (false, false) RETURNING id`,
    );
    [{ id: userId }] = await q(
      `INSERT INTO "user" (type, name, email, phone, active_organization_id, has_account, notifications_settings_id)
       VALUES ('regular', 'Elena Pop', 'elena@example.ro', '+40720000001', $1, true, $2) RETURNING id`,
      [organizationId, settings.id],
    );
    volunteerToken = await testApp.mintAccessToken(
      await facade.createIdentity({
        realm: AuthRealm.MOBILE,
        email: 'elena@example.ro',
        status: AuthIdentityStatus.ACTIVE,
        userId,
      }),
      AuthRealm.MOBILE,
    );
    [{ id: volunteerId }] = await q(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active') RETURNING id`,
      [userId, organizationId],
    );
  });

  it('made inactive by the NGO: the organization stays the active one and is listed as inactive', async () => {
    await request(testApp.app.getHttpServer())
      .patch(`/volunteer/${volunteerId}/archive`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const res = await profile();
    expect(res.body.myOrganizations).toEqual([
      expect.objectContaining({
        id: organizationId,
        volunteerId,
        volunteerStatus: 'inactive',
      }),
    ]);
    const [user] = await q(
      `SELECT active_organization_id FROM "user" WHERE id = $1`,
      [userId],
    );
    expect(user.active_organization_id).toBe(organizationId);
  });

  it('left by themselves: the organization is no longer theirs', async () => {
    await q(
      `UPDATE volunteer SET status = 'inactive', archived_by = $1 WHERE id = $2`,
      [userId, volunteerId],
    );

    expect((await profile()).body.myOrganizations).toEqual([]);
  });
});
