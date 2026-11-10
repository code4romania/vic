import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #593: access codes match whatever the case and cannot end before they start; the actions history logs
// access codes, announcement edits and status changes, and the hours a volunteer deletes; latest first.
describe('Access codes and actions history (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  let elena: IAuthIdentityModel;
  let organizationId: string;
  let volunteerId: string;

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;
  const web = async (): Promise<string> =>
    `Bearer ${await testApp.mintAccessToken(admin, AuthRealm.WEB)}`;
  const mobile = async (): Promise<string> =>
    `Bearer ${await testApp.mintAccessToken(elena, AuthRealm.MOBILE)}`;

  const history = async (): Promise<
    { eventName: string; author: { name: string } }[]
  > => {
    const { body } = await http()
      .get('/actions-archive')
      .query({ limit: 10, page: 1 })
      .set('Authorization', await web())
      .expect(200);
    return body.items;
  };

  // The actions are saved by an event listener, after the response
  const eventually = async (count: number): Promise<void> => {
    for (let i = 0; i < 50; i++) {
      const [row] = await testApp.dataSource.query(
        `SELECT COUNT(*) AS count FROM actions_archive`,
      );
      if (+row.count >= count) return;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
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
      'actions_archive',
      'access_code',
      'announcement',
      'activity_log',
      'volunteer',
      'user',
      'notifications_settings',
      'organization',
    ]);
    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ('Crucea', 'org@crucea.ro', '+40700000000', 'active', now()) RETURNING id`,
    );
    organizationId = organization.id;
    const [adminUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana Admin', 'ana@crucea.ro', '+40711111111', $1) RETURNING id`,
      [organizationId],
    );
    admin = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.WEB,
      email: 'ana@crucea.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: adminUser.id,
    });
    const [settings] = await testApp.dataSource.query(
      `INSERT INTO notifications_settings (notifications_via_email, notifications_via_push) VALUES (false, false) RETURNING id`,
    );
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, first_name, last_name, email, phone, birthday, notifications_settings_id, active_organization_id)
       VALUES ('regular', 'Elena Pop', 'Elena', 'Pop', 'elena@example.ro', '+40722000000', '1995-04-12', $1, $2) RETURNING id`,
      [settings.id, organizationId],
    );
    elena = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'elena@example.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: user.id,
    });
    const [volunteer] = await testApp.dataSource.query(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active') RETURNING id`,
      [user.id, organizationId],
    );
    volunteerId = volunteer.id;
  });

  it('refuses an end date before the start date, on create and on edit: 400 ACCESS_CODE_003', async () => {
    const created = await http()
      .post('/access-code')
      .set('Authorization', await web())
      .send({ code: 'QATEST1', startDate: '2026-11-10', endDate: '2026-11-01' })
      .expect(400);
    expect(created.body.code_error).toBe('ACCESS_CODE_003');

    const { body: code } = await http()
      .post('/access-code')
      .set('Authorization', await web())
      .send({ code: 'QATEST1', startDate: '2026-11-10' })
      .expect(201);

    const edited = await http()
      .patch(`/access-code/${code.id}`)
      .set('Authorization', await web())
      .send({ endDate: '2026-11-09' })
      .expect(400);
    expect(edited.body.code_error).toBe('ACCESS_CODE_003');

    // the same day is fine
    await http()
      .patch(`/access-code/${code.id}`)
      .set('Authorization', await web())
      .send({ endDate: '2026-11-10' })
      .expect(200);
  });

  it('matches access codes whatever the case', async () => {
    await http()
      .post('/access-code')
      .set('Authorization', await web())
      .send({ code: 'QATEST1', startDate: new Date().toISOString() })
      .expect(201);

    // the same code in lower case is a duplicate
    const duplicate = await http()
      .post('/access-code')
      .set('Authorization', await web())
      .send({ code: 'qatest1', startDate: new Date().toISOString() })
      .expect(400);
    expect(duplicate.body.code_error).toBe('ACCESS_CODE_002');

    // a new volunteer joins with "Qatest1", as iOS capitalizes the first letter
    await testApp.dataSource.query(`DELETE FROM volunteer`);
    await http()
      .post('/mobile/volunteer/access-code')
      .set('Authorization', await mobile())
      .send({ organizationId, code: 'Qatest1' })
      .expect(201);
    const [code] = await testApp.dataSource.query(
      `SELECT usage_count FROM access_code`,
    );
    expect(code.usage_count).toBe(1);
  });

  it('logs access codes and announcement changes, latest first', async () => {
    const { body: code } = await http()
      .post('/access-code')
      .set('Authorization', await web())
      .send({ code: 'VARA2026', startDate: '2026-11-10' })
      .expect(201);
    await eventually(1);
    await http()
      .patch(`/access-code/${code.id}`)
      .set('Authorization', await web())
      .send({ endDate: '2026-12-31' })
      .expect(200);
    await eventually(2);
    await http()
      .delete(`/access-code/${code.id}`)
      .set('Authorization', await web())
      .expect(200);
    await eventually(3);

    const [announcement] = await testApp.dataSource.query(
      `INSERT INTO announcement (name, description, status, organization_id, display_start_date, published_on)
       VALUES ('Recrutăm', 'd', 'active', $1, now(), now()) RETURNING id`,
      [organizationId],
    );
    await http()
      .patch(`/announcement/${announcement.id}`)
      .set('Authorization', await web())
      .send({ name: 'Recrutăm voluntari' })
      .expect(200);
    await eventually(4);
    await http()
      .patch(`/announcement/${announcement.id}/deactivate`)
      .set('Authorization', await web())
      .expect(200);
    await eventually(5);

    expect((await history()).map((action) => action.eventName)).toEqual([
      'CHANGE_ANNOUNCEMENT_STATUS',
      'UPDATE_ANNOUNCEMENT',
      'DELETE_ACCESS_CODE',
      'UPDATE_ACCESS_CODE',
      'CREATE_ACCESS_CODE',
    ]);
  });

  it('shows the NGO the pending hours its volunteer deleted', async () => {
    const [log] = await testApp.dataSource.query(
      `INSERT INTO activity_log (date, hours, status, volunteer_id, organization_id)
       VALUES (now(), 3, 'pending', $1, $2) RETURNING id`,
      [volunteerId, organizationId],
    );
    await http()
      .delete(`/mobile/activity-log/${log.id}`)
      .set('Authorization', await mobile())
      .expect(200);
    await eventually(1);

    expect(await history()).toEqual([
      expect.objectContaining({
        eventName: 'CANCEL_ACTIVITY_LOG',
        author: expect.objectContaining({ name: 'Elena Pop' }),
      }),
    ]);
  });
});
