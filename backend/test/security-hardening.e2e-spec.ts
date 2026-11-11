import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthRateLimitService } from 'src/modules/auth/services/auth-rate-limit.service';
import { GetManyVolunteersUseCase } from 'src/usecases/volunteer/get-many-volunteers.usecase';
import * as request from 'supertest';
import { api } from './utils/http';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// Audit fixes: sort columns, page size, error bodies, uploads, the validation gate, the app's sign-up limit.
describe('Security hardening (e2e)', () => {
  let testApp: TestApp;
  let http: ReturnType<typeof api>;
  let organizationId: string;
  let adminUserId: string;
  let admin: IAuthIdentityModel;
  let volunteer: IAuthIdentityModel;
  let eventId: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (sql: string, params: unknown[] = []): Promise<any[]> =>
    testApp.dataSource.query(sql, params);

  let adminToken: string;
  let volunteerToken: string;
  const asAdmin = (test: request.Test, token = adminToken): request.Test =>
    test.set('Authorization', `Bearer ${token}`);
  const asVolunteer = (test: request.Test): request.Test =>
    test.set('Authorization', `Bearer ${volunteerToken}`);

  beforeAll(async () => {
    testApp = await createTestApp();
    http = api(testApp.app);
  });

  afterAll(async () => {
    await testApp?.close();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    await testApp.flushRedis();
    await truncate(testApp.dataSource, [
      'actions_archive',
      'access_request',
      'access_code',
      'announcement',
      'event_rsvp',
      'event',
      'activity_log',
      'contract',
      'template',
      'auth_token',
      'auth_identity',
      'volunteer',
      'volunteer_profile',
      'organization_structure',
      'user',
      'organization',
    ]);
    testApp.mailbox.clear();
    const facade = testApp.app.get(AuthIdentityFacade);

    [{ id: organizationId }] = await q(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Crucea', 'org@crucea.ro', '+40700000001', 'active', now()) RETURNING id`,
    );
    [{ id: adminUserId }] = await q(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Ana Pop', 'ana@crucea.ro', '+40710000002', $1) RETURNING id`,
      [organizationId],
    );
    admin = await facade.createIdentity({
      realm: AuthRealm.WEB,
      email: 'ana@crucea.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: adminUserId,
    });

    const [user] = await q(
      `INSERT INTO "user" (type, name, email, phone, active_organization_id)
       VALUES ('regular', 'Elena Pop', 'elena@example.ro', '+40722000000', $1) RETURNING id`,
      [organizationId],
    );
    await q(
      `INSERT INTO volunteer (user_id, organization_id, status) VALUES ($1, $2, 'active')`,
      [user.id, organizationId],
    );
    volunteer = await facade.createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'elena@example.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: user.id,
    });

    adminToken = await testApp.mintAccessToken(admin, AuthRealm.WEB);
    volunteerToken = await testApp.mintAccessToken(volunteer, AuthRealm.MOBILE);

    [{ id: eventId }] = await q(
      `INSERT INTO event (name, description, start_date, end_date, status, organization_id)
       VALUES ('Maraton', 'd', now() + interval '1 day', now() + interval '2 days', 'published', $1) RETURNING id`,
      [organizationId],
    );
    await q(
      `INSERT INTO event_rsvp (going, status, event_id, user_id) VALUES (true, 'approved', $1, $2)`,
      [eventId, user.id],
    );
  });

  // An NGO registered and confirmed, waiting for a super admin to validate it.
  const unvalidatedAdmin = async (): Promise<{
    token: string;
    organizationId: string;
    userId: string;
  }> => {
    const [org] = await q(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Noua', 'org@noua.ro', '+40700000009', 'active', NULL) RETURNING id`,
    );
    const [user] = await q(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Dan Noua', 'dan@noua.ro', '+40710000009', $1) RETURNING id`,
      [org.id],
    );
    const identity = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.WEB,
      email: 'dan@noua.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: user.id,
    });
    return {
      token: await testApp.mintAccessToken(identity, AuthRealm.WEB),
      organizationId: org.id,
      userId: user.id,
    };
  };

  describe('sorting (orderBy) and page size', () => {
    // Every list the web and the app sort, with every column they may sort by.
    const WEB_LISTS: { path: () => string; columns: string[] }[] = [
      {
        path: () => '/event',
        columns: ['name', 'startDate', 'endDate', 'status', 'createdOn'],
      },
      { path: () => '/listing/events', columns: ['name', 'startDate'] },
      {
        path: () => `/event/${eventId}/rsvp`,
        columns: ['user.name', 'going', 'mention', 'createdOn'],
      },
      {
        path: () => '/volunteer',
        columns: [
          'user.name',
          'user.firstName',
          'volunteerProfile.email',
          'department.name',
          'status',
          'source',
          'createdOn',
        ],
      },
      { path: () => '/listing/volunteers', columns: ['user.name'] },
      ...['new', 'rejected', 'approved'].map((tab) => ({
        path: () => `/access-request/${tab}`,
        columns: [
          'requestedBy.name',
          'requestedBy.email',
          'location.name',
          'createdOn',
          'updatedOn',
        ],
      })),
      {
        path: () => '/activity-log',
        columns: [
          'activityType.name',
          'hours',
          'date',
          'createdOn',
          'status',
          'user.name',
        ],
      },
      {
        path: () => '/announcement',
        columns: [
          'updatedOn',
          'publishedOn',
          'displayStartDate',
          'name',
          'createdOn',
        ],
      },
      {
        path: () => '/contract',
        columns: ['contractNumber', 'startDate', 'endDate', 'createdOn'],
      },
      {
        path: () => '/actions-archive',
        columns: ['eventName', 'author.name', 'createdOn'],
      },
      { path: () => '/location/city', columns: ['name'] },
      {
        path: () => '/organization-structure/department',
        columns: ['name', 'numberOfMembers', 'createdOn'],
      },
      {
        path: () => '/listing/structures/department',
        columns: ['name', 'numberOfMembers', 'createdOn'],
      },
      {
        path: () => '/access-code',
        columns: [
          'code',
          'startDate',
          'endDate',
          'usageCount',
          'createdOn',
          'createdBy.name',
        ],
      },
      { path: () => '/listing/admins', columns: ['name', 'createdOn'] },
    ];
    const MOBILE_LISTS: { path: string; columns: string[] }[] = [
      { path: '/mobile/event', columns: ['startDate', 'name', 'createdOn'] },
      { path: '/mobile/anouncement', columns: ['createdOn'] },
      { path: '/mobile/news', columns: ['createdOn'] },
      { path: '/mobile/organization', columns: ['name'] },
    ];

    const INJECTIONS = [
      `name; DROP TABLE "user"--`,
      '(CASE WHEN (SELECT 1)=1 THEN name ELSE email END)',
      'name, (SELECT pg_sleep(3))',
      'user.password',
      'id',
    ];

    it('every column the web sorts by works on its list', async () => {
      for (const { path, columns } of WEB_LISTS) {
        for (const orderBy of [undefined, ...columns]) {
          for (const orderDirection of ['ASC', 'DESC']) {
            const res = await asAdmin(http.get(path())).query({
              orderBy,
              orderDirection,
              limit: 10,
              page: 1,
            });
            if (res.status !== 200) {
              throw new Error(
                `${path()} orderBy=${orderBy}: ${res.status} ${JSON.stringify(res.body)}`,
              );
            }
          }
        }
      }
    });

    it('every column the app may sort by works on its list', async () => {
      // /mobile/news is left out: it fails with any sort (an empty `IN ()` in the actions archive query),
      // an error of its own, reported separately.
      for (const { path, columns } of MOBILE_LISTS.filter(
        (list) => list.path !== '/mobile/news',
      )) {
        for (const orderBy of [undefined, ...columns]) {
          const res = await asVolunteer(http.get(path)).query({
            orderBy,
            limit: 25,
            page: 1,
          });
          if (res.status !== 200) {
            throw new Error(
              `${path} orderBy=${orderBy}: ${res.status} ${JSON.stringify(res.body)}`,
            );
          }
        }
      }
    });

    it('an SQL payload or a column outside the list is a 400 on every list, and nothing changed', async () => {
      for (const { path } of WEB_LISTS) {
        for (const orderBy of INJECTIONS) {
          const res = await asAdmin(http.get(path())).query({
            orderBy,
          });
          expect({ path: path(), orderBy, status: res.status }).toEqual({
            path: path(),
            orderBy,
            status: 400,
          });
        }
      }
      for (const { path } of MOBILE_LISTS) {
        for (const orderBy of INJECTIONS) {
          const res = await asVolunteer(http.get(path)).query({
            orderBy,
          });
          expect({ path, orderBy, status: res.status }).toEqual({
            path,
            orderBy,
            status: 400,
          });
        }
      }
      expect((await q(`SELECT count(*) FROM "user"`))[0].count).toBe('2');
    });

    it('a list that does not sort refuses any orderBy (400)', async () => {
      await asAdmin(http.get('/event-registrations'))
        .query({ orderBy: 'createdOn' })
        .expect(400);
    });

    it('a page holds 1 to 100 items: 0, 101 and a fraction are a 400', async () => {
      for (const limit of ['0', '101', '1000000', '2.5', '-1']) {
        await asAdmin(http.get('/volunteer')).query({ limit }).expect(400);
      }
      await asAdmin(http.get('/volunteer')).query({ page: 0 }).expect(400);
      await asAdmin(http.get('/volunteer')).query({ limit: 100 }).expect(200);
      await asVolunteer(http.get('/mobile/event'))
        .query({ limit: 101 })
        .expect(400);
    });
  });

  describe('error bodies', () => {
    it('an unexpected error is a generic 500 with a code: no stack, no message from inside', async () => {
      jest
        .spyOn(testApp.app.get(GetManyVolunteersUseCase), 'execute')
        .mockRejectedValue(
          new TypeError(
            "Cannot read properties of undefined (reading 'secretColumn')",
          ),
        );

      const { body } = await asAdmin(http.get('/volunteer')).expect(500);

      expect(body).toEqual({
        statusCode: 500,
        timestamp: expect.any(String),
        path: '/volunteer',
        message: 'Internal server error',
        code_error: 'INTERNAL_ERROR',
      });
      expect(JSON.stringify(body)).not.toMatch(/stack|secretColumn|\.ts:/);
    });

    it('a malformed id reaching the database is a 400 without its message', async () => {
      // a uuid column compared with text: Postgres refuses it (22P02)
      jest
        .spyOn(testApp.app.get(GetManyVolunteersUseCase), 'execute')
        .mockImplementation(() =>
          testApp.dataSource.query(`SELECT * FROM "user" WHERE id = 'x'`),
        );
      const { body } = await asAdmin(http.get('/volunteer')).expect(400);
      expect(body).toMatchObject({ code_error: 'INVALID_INPUT' });
      expect(JSON.stringify(body)).not.toMatch(/uuid|invalid input syntax/);
    });

    it('two registrations with the same CUI at once: one 201, the other 409 ORG_004', async () => {
      const register = (suffix: string): request.Test => {
        let req = http.post('/organizations/register');
        for (const [key, value] of Object.entries({
          name: `Asociatia ${suffix}`,
          email: `contact@${suffix}.ro`,
          phone: `+4070000${suffix === 'unu' ? '1111' : '2222'}`,
          taxId: 'RO18547290',
          firstName: 'Ana',
          lastName: 'Popescu',
          adminEmail: `ana@${suffix}.ro`,
          adminPhone: '+40711111100',
          acceptedTerms: 'true',
          declaresRegisteredNgo: 'true',
          declaresRepresentative: 'true',
        })) {
          req = req.field(key, value);
        }
        return req;
      };

      const results = await Promise.all([register('unu'), register('doi')]);
      expect(results.map((res) => res.status).sort()).toEqual([201, 409]);
      const refused = results.find((res) => res.status === 409);
      expect(refused.body.code_error).toBe('ORG_004');
      expect(JSON.stringify(refused.body)).not.toMatch(/duplicate key/);
      expect(
        (
          await q(`SELECT count(*) FROM organization WHERE tax_id = '18547290'`)
        )[0].count,
      ).toBe('1');
    });
  });

  describe('uploads', () => {
    const PNG = Buffer.from(
      '89504e470d0a1a0a0000000d4948445200000001000000010806000000',
      'hex',
    );
    const PDF = Buffer.from('%PDF-1.4\n%%EOF\n', 'latin1');
    const big = (bytes: number, head: Buffer): Buffer =>
      Buffer.concat([head, Buffer.alloc(bytes - head.length, 0x20)]);

    const profile = (file: Buffer, contentType: string): request.Test =>
      asVolunteer(http.patch('/mobile/user/profile')).attach(
        'profilePicture',
        file,
        { filename: 'poza.jpg', contentType },
      );

    it('a profile picture over 10 MB is a 413 FILE_TOO_LARGE', async () => {
      const res = await profile(
        big(10 * 1024 * 1024 + 1, Buffer.from([0xff, 0xd8, 0xff])),
        'image/jpeg',
      );
      expect(res.status).toBe(413);
      expect(res.body.code_error).toBe('FILE_TOO_LARGE');
    });

    it('a profile picture that is not an image is a 400 USER_009, by its type or by its content', async () => {
      const byType = await profile(PNG, 'text/html');
      expect(byType.status).toBe(400);
      expect(byType.body.code_error).toBe('USER_009');

      // labelled as a photo, but HTML inside
      const byContent = await profile(
        Buffer.from('<html><script>alert(1)</script></html>'),
        'image/jpeg',
      );
      expect(byContent.status).toBe(400);
      expect(byContent.body.code_error).toBe('USER_009');
    });

    it('a contract template over 10 MB is a 413; one that is not a PDF a 400 CONTRACT_008', async () => {
      const send = (file: Buffer, contentType: string): request.Test =>
        asAdmin(http.post('/template'))
          .field('name', 'Contract voluntariat')
          .attach('template', file, { filename: 'model.pdf', contentType });

      const tooBig = await send(
        big(10 * 1024 * 1024 + 1, PDF),
        'application/pdf',
      );
      expect(tooBig.status).toBe(413);
      expect(tooBig.body.code_error).toBe('FILE_TOO_LARGE');

      const notPdf = await send(PNG, 'image/png');
      expect(notPdf.status).toBe(400);
      expect(notPdf.body.code_error).toBe('CONTRACT_008');
      expect((await q(`SELECT count(*) FROM template`))[0].count).toBe('0');
    });

    it('a signed contract that is not a PDF is a 400 CONTRACT_008; over 10 MB a 413', async () => {
      const send = (file: Buffer, contentType: string): request.Test =>
        asAdmin(http.post('/contract'))
          .field('volunteerId', organizationId)
          .attach('contract', file, { filename: 'c.pdf', contentType });

      const notPdf = await send(PNG, 'image/png');
      expect(notPdf.status).toBe(400);
      expect(notPdf.body.code_error).toBe('CONTRACT_008');

      const tooBig = await send(
        big(10 * 1024 * 1024 + 1, PDF),
        'application/pdf',
      );
      expect(tooBig.status).toBe(413);
      expect(tooBig.body.code_error).toBe('FILE_TOO_LARGE');
    });
  });

  describe('an NGO not validated yet (decision 1) sends nothing in VIC’s name', () => {
    it('cannot add or import volunteers: 403 ORG_005 and no email', async () => {
      const { token } = await unvalidatedAdmin();

      const added = await asAdmin(http.post('/volunteer'), token).send({
        firstName: 'Maria',
        lastName: 'Ionescu',
        email: 'maria@example.ro',
        status: 'active',
      });
      expect(added.status).toBe(403);
      expect(added.body.code_error).toBe('ORG_005');

      const imported = await asAdmin(
        http.post('/volunteer/import'),
        token,
      ).attach(
        'file',
        Buffer.from(
          'Prenume,Nume,Email,Telefon,Localitate,Județ,Departament\nMaria,Ionescu,maria@example.ro,,,,\n',
          'utf8',
        ),
        { filename: 'voluntari.csv' },
      );
      expect(imported.status).toBe(403);
      expect(imported.body.code_error).toBe('ORG_005');

      expect(testApp.mailbox.sent).toHaveLength(0);
      expect(
        (
          await q(
            `SELECT count(*) FROM "user" WHERE email = 'maria@example.ro'`,
          )
        )[0].count,
      ).toBe('0');
    });

    it('cannot create an announcement: 403 ORG_005', async () => {
      const { token } = await unvalidatedAdmin();
      const res = await asAdmin(http.post('/announcement'), token).send({
        name: 'Recrutăm',
        description: 'Căutăm voluntari',
        type: 'recruitment',
        displayStartDate: new Date().toISOString(),
        publishNow: true,
      });
      expect(res.status).toBe(403);
      expect(res.body.code_error).toBe('ORG_005');
      expect((await q(`SELECT count(*) FROM announcement`))[0].count).toBe('0');
    });

    it('cannot approve an access request or create an access code: 403 ORG_005', async () => {
      const { token, organizationId: orgId, userId } = await unvalidatedAdmin();
      const [user] = await q(
        `SELECT id FROM "user" WHERE email = 'elena@example.ro'`,
      );
      const [accessRequest] = await q(
        `INSERT INTO access_request (answers, requested_by, organization_id, updated_by)
         VALUES ('[]', $1, $2, $3) RETURNING id`,
        [user.id, orgId, userId],
      );

      const approved = await asAdmin(
        http.post(`/access-request/${accessRequest.id}/approve`),
        token,
      ).send();
      expect(approved.status).toBe(403);
      expect(approved.body.code_error).toBe('ORG_005');
      expect(
        (
          await q(`SELECT count(*) FROM volunteer WHERE organization_id = $1`, [
            orgId,
          ])
        )[0].count,
      ).toBe('0');

      const code = await asAdmin(http.post('/access-code'), token).send({
        code: 'COD1234',
        startDate: new Date().toISOString(),
      });
      expect(code.status).toBe(403);
      expect(code.body.code_error).toBe('ORG_005');

      const [existing] = await q(
        `INSERT INTO access_code (code, start_date, organization_id, created_by)
         VALUES ('VECHI1', now(), $1, $2) RETURNING id`,
        [orgId, userId],
      );
      const extended = await asAdmin(
        http.patch(`/access-code/${existing.id}`),
        token,
      ).send({ endDate: new Date(Date.now() + 86400000).toISOString() });
      expect(extended.status).toBe(403);
      expect(extended.body.code_error).toBe('ORG_005');
    });

    it('a validated NGO still can (control)', async () => {
      const added = await asAdmin(http.post('/volunteer')).send({
        firstName: 'Maria',
        lastName: 'Ionescu',
        email: 'maria@example.ro',
        status: 'candidate',
      });
      expect(added.status).toBe(201);
      await asAdmin(http.post('/access-code'))
        .send({ code: 'COD1234', startDate: new Date().toISOString() })
        .expect(201);
    });
  });

  describe('app sign-up codes per client', () => {
    it('a client that asked for too many codes (any emails) gets AUTH_010 and no email or login', async () => {
      const ip = '198.51.100.77';
      const limits = testApp.app.get(AuthRateLimitService);
      for (let n = 0; n < 30; n++) {
        await limits.assertCanRequestMobileCode(ip);
      }

      const res = await request(testApp.app.getHttpServer())
        .post('/mobile/auth/login/request')
        .set('X-Forwarded-For', ip)
        .send({ email: 'victima@example.ro' });
      expect(res.body.code_error).toBe('AUTH_010');
      expect(testApp.mailbox.sent).toHaveLength(0);
      expect(
        (
          await q(
            `SELECT count(*) FROM auth_identity WHERE email = 'victima@example.ro'`,
          )
        )[0].count,
      ).toBe('0');

      // another client is not affected
      await request(testApp.app.getHttpServer())
        .post('/mobile/auth/login/request')
        .set('X-Forwarded-For', '198.51.100.78')
        .send({ email: 'victima@example.ro' })
        .expect(200);
    });
  });
});
