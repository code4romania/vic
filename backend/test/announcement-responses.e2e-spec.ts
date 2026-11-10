import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #504: volunteers answer announcements from the app, with a comment, once; the NGO sees the answers.
describe('Announcement responses (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  let organizationId: string;
  let announcementId: string;
  const people: Record<string, IAuthIdentityModel> = {};

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  const respond = async (
    name: string,
    comment: string | undefined,
    status: number,
    id = announcementId,
  ): Promise<request.Response> =>
    http()
      .post(`/mobile/anouncement/${id}/response`)
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(people[name], AuthRealm.MOBILE)}`,
      )
      .send(comment === undefined ? {} : { comment })
      .expect(status);

  const responses = async (
    token?: string,
    status = 200,
  ): Promise<request.Response> =>
    http()
      .get(`/announcement/${announcementId}/responses`)
      .set(
        'Authorization',
        `Bearer ${token ?? (await testApp.mintAccessToken(admin, AuthRealm.WEB))}`,
      )
      .expect(status);

  const insertAnnouncement = async (
    name: string,
    status: string,
    start = "now() - interval '1 day'",
    end = 'NULL',
  ): Promise<string> => {
    const [row] = await testApp.dataSource.query(
      `INSERT INTO announcement (name, description, status, organization_id, display_start_date, display_end_date)
       VALUES ($1, 'd', $2, $3, ${start}, ${end}) RETURNING id`,
      [name, status, organizationId],
    );
    return row.id;
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
      'announcement_response',
      'announcement',
      'volunteer',
      'volunteer_profile',
      'user',
      'organization',
    ]);
    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ('Org', 'org@example.ro', '+40700000000', 'active', now()) RETURNING id`,
    );
    organizationId = organization.id;
    const [adminUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana Admin', 'admin@example.ro', '+40711111111', $1) RETURNING id`,
      [organizationId],
    );
    admin = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.WEB,
      email: 'admin@example.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: adminUser.id,
    });

    const person = async (name: string, status?: string): Promise<void> => {
      const email = `${name.toLowerCase()}@example.ro`;
      const [user] = await testApp.dataSource.query(
        `INSERT INTO "user" (type, name, email, phone) VALUES ('regular', $1, $2, '+40722000000') RETURNING id`,
        [name, email],
      );
      if (status) {
        const [profile] = await testApp.dataSource.query(
          `INSERT INTO volunteer_profile (email) VALUES ($1) RETURNING id`,
          [`${name.toLowerCase()}@ong.ro`],
        );
        await testApp.dataSource.query(
          `INSERT INTO volunteer (user_id, organization_id, status, volunteer_profile_id) VALUES ($1, $2, $3, $4)`,
          [user.id, organizationId, status, profile.id],
        );
      }
      people[name] = await testApp.app.get(AuthIdentityFacade).createIdentity({
        realm: AuthRealm.MOBILE,
        email,
        status: AuthIdentityStatus.ACTIVE,
        userId: user.id,
      });
    };
    await person('Bogdan', 'active');
    await person('Cristi', 'active');
    await person('Dan', 'inactive');
    await person('Ion');

    announcementId = await insertAnnouncement('Căutăm voluntari', 'active');
  });

  it('a volunteer answers once; the NGO sees the answers with volunteer and date', async () => {
    await respond('Bogdan', '  Vin sâmbătă  ', 201);
    await respond('Cristi', 'Pot ajuta la logistică', 201);
    const again = await respond('Bogdan', 'Încă o dată', 400);
    expect(again.body.code_error).toBe('ANNOUNCEMENT_007');

    const { body } = await responses();
    expect(body.meta.totalItems).toBe(2);
    expect(
      body.items.map(
        (r: { user: { name: string; email: string }; comment: string }) => [
          r.user.name,
          r.user.email,
          r.comment,
        ],
      ),
    ).toEqual([
      ['Cristi', 'cristi@ong.ro', 'Pot ajuta la logistică'],
      ['Bogdan', 'bogdan@ong.ro', 'Vin sâmbătă'],
    ]);
    expect(body.items[0].createdOn).toBeDefined();
    expect(body.items[0].volunteerId).toBeDefined();
  });

  it('two answers sent at once: one is kept, the other gets 400 ANNOUNCEMENT_007, never a 500', async () => {
    const token = await testApp.mintAccessToken(
      people.Bogdan,
      AuthRealm.MOBILE,
    );
    const send = (): request.Test =>
      http()
        .post(`/mobile/anouncement/${announcementId}/response`)
        .set('Authorization', `Bearer ${token}`)
        .send({ comment: 'Vin' });
    const results = await Promise.all([send(), send(), send()]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 400, 400]);
    for (const r of results.filter((r) => r.status === 400)) {
      expect(r.body.code_error).toBe('ANNOUNCEMENT_007');
    }
    expect((await responses()).body.meta.totalItems).toBe(1);
  });

  it("shows the volunteer's own answer in the app list", async () => {
    await respond('Bogdan', 'Vin', 201);
    const token = await testApp.mintAccessToken(
      people['Bogdan'],
      AuthRealm.MOBILE,
    );
    const { body } = await http()
      .get('/mobile/anouncement')
      .query({ limit: 10, page: 1 })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].myResponse).toMatchObject({ comment: 'Vin' });

    const other = await http()
      .get('/mobile/anouncement')
      .query({ limit: 10, page: 1 })
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(people['Cristi'], AuthRealm.MOBILE)}`,
      )
      .expect(200);
    expect(other.body.items[0].myResponse).toBeNull();
  });

  it('needs a comment', async () => {
    await respond('Bogdan', '   ', 400);
    await respond('Bogdan', undefined, 400);
    await respond('Bogdan', 'x'.repeat(501), 400);
  });

  it('only active volunteers, only announcements the app shows: 400 ANNOUNCEMENT_006', async () => {
    for (const name of ['Dan', 'Ion']) {
      const response = await respond(name, 'Vin', 400);
      expect(response.body.code_error).toBe('ANNOUNCEMENT_006');
    }
    const inactive = await insertAnnouncement('Inactiv', 'inactive');
    const future = await insertAnnouncement(
      'Viitor',
      'active',
      "now() + interval '1 day'",
    );
    const ended = await insertAnnouncement(
      'Expirat',
      'active',
      "now() - interval '3 days'",
      "now() - interval '1 day'",
    );
    for (const id of [inactive, future, ended]) {
      const response = await respond('Bogdan', 'Vin', 400, id);
      expect(response.body.code_error).toBe('ANNOUNCEMENT_006');
    }
  });

  it("does not show the answers to another organization's admin", async () => {
    await respond('Bogdan', 'Vin', 201);
    const [other] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ('Alt ONG', 'alt@example.ro', '+40700000001', 'active', now()) RETURNING id`,
    );
    await testApp.dataSource.query(
      `UPDATE "user" SET organization_id = $1 WHERE email = 'admin@example.ro'`,
      [other.id],
    );
    await responses(undefined, 403);
  });
});
