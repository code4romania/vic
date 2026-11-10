import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #592: a volunteer leaves an organization from the app; they are not told that the organization
// deactivated them (that message is for the NGO's own decision).
describe('Leave organization (e2e)', () => {
  let testApp: TestApp;
  let volunteerToken: string;
  let volunteerId: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (sql: string, params: unknown[] = []): Promise<any[]> =>
    testApp.dataSource.query(sql, params);

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    testApp.mailbox.clear();
    await truncate(testApp.dataSource, [
      'actions_archive',
      'auth_identity',
      'volunteer',
      'user',
      'notifications_settings',
      'organization',
    ]);
    const [organization] = await q(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Crucea Verde', 'org@crucea.ro', '+40700000001', 'active', now()) RETURNING id`,
    );
    const [settings] = await q(
      `INSERT INTO notifications_settings (notifications_via_email, notifications_via_push) VALUES (true, false) RETURNING id`,
    );
    const [user] = await q(
      `INSERT INTO "user" (type, name, email, phone, active_organization_id, has_account, notifications_settings_id)
       VALUES ('regular', 'Elena Pop', 'elena@example.ro', '+40720000001', $1, true, $2) RETURNING id`,
      [organization.id, settings.id],
    );
    volunteerToken = await testApp.mintAccessToken(
      await testApp.app.get(AuthIdentityFacade).createIdentity({
        realm: AuthRealm.MOBILE,
        email: 'elena@example.ro',
        status: AuthIdentityStatus.ACTIVE,
        userId: user.id,
      }),
      AuthRealm.MOBILE,
    );
    [{ id: volunteerId }] = await q(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active') RETURNING id`,
      [user.id, organization.id],
    );
  });

  it('leaves: the volunteer is inactive, archived by themselves, and gets no "deactivated" email', async () => {
    await request(testApp.app.getHttpServer())
      .delete(`/mobile/organization/${volunteerId}`)
      .set('Authorization', `Bearer ${volunteerToken}`)
      .expect(200);

    const [volunteer] = await q(
      `SELECT v.status, v.archived_by::text = u.id::text AS by_self
       FROM volunteer v JOIN "user" u ON u.id = v.user_id WHERE v.id = $1`,
      [volunteerId],
    );
    expect(volunteer).toEqual({ status: 'inactive', by_self: true });
    // let the async listeners run
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(testApp.mailbox.sent).toHaveLength(0);
  });
});
