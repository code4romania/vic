import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// #471: the NGO adds a volunteer from one form, as Candidate (no email, no account) or Active (invited).
describe('Add a volunteer (e2e)', () => {
  let testApp: TestApp;
  let admin: IAuthIdentityModel;
  let otherAdmin: IAuthIdentityModel;
  let organizationId: string;
  let departmentId: string;
  let otherDepartmentId: string;

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  const add = async (
    body: Record<string, unknown>,
    status: number,
    by = admin,
  ): Promise<request.Response> =>
    http()
      .post('/volunteer')
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(by, AuthRealm.WEB)}`,
      )
      .send({
        firstName: 'Maria',
        lastName: 'Ionescu',
        email: 'Maria.Ionescu@Example.ro',
        status: 'candidate',
        ...body,
      })
      .expect(status);

  const userRow = async (email: string): Promise<Record<string, unknown>> =>
    (
      await testApp.dataSource.query(
        `SELECT id, name, phone, birthday, has_account, active_organization_id FROM "user" WHERE email = $1`,
        [email],
      )
    )[0];

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
      'organization_structure',
      'user',
      'organization',
    ]);
    testApp.mailbox.clear();

    const organization = async (
      name: string,
      adminEmail: string,
    ): Promise<{
      id: string;
      admin: IAuthIdentityModel;
      department: string;
    }> => {
      const [org] = await testApp.dataSource.query(
        `INSERT INTO organization (name, email, phone, status, validated_at) VALUES ($1, $2, $3, 'active', now()) RETURNING id`,
        [name, `contact@${name.toLowerCase()}.ro`, `+4070000${name.length}000`],
      );
      const [adminUser] = await testApp.dataSource.query(
        `INSERT INTO "user" (type, name, email, phone, organization_id)
         VALUES ('admin', 'Admin', $1, '+40711111111', $2) RETURNING id`,
        [adminEmail, org.id],
      );
      const identity = await testApp.app
        .get(AuthIdentityFacade)
        .createIdentity({
          realm: AuthRealm.WEB,
          email: adminEmail,
          status: AuthIdentityStatus.ACTIVE,
          userId: adminUser.id,
        });
      const [department] = await testApp.dataSource.query(
        `INSERT INTO organization_structure (name, type, organization_id, created_by) VALUES ('Logistică', 'department', $1, $2) RETURNING id`,
        [org.id, adminUser.id],
      );
      return { id: org.id, admin: identity, department: department.id };
    };

    const first = await organization('Crucea', 'ana@crucea.ro');
    organizationId = first.id;
    admin = first.admin;
    departmentId = first.department;
    const second = await organization('Salvati', 'dan@salvati.ro');
    otherAdmin = second.admin;
    otherDepartmentId = second.department;
  });

  it('adds a Candidate: a placeholder user with no account, the department and notes, and no email', async () => {
    const { body } = await add(
      {
        phone: '+40722000000',
        birthday: '1995-04-12',
        departmentId,
        notes: '  A venit de la târgul ONG  ',
      },
      201,
    );

    expect(body).toMatchObject({
      status: 'candidate',
      notes: 'A venit de la târgul ONG',
      user: expect.objectContaining({ name: 'Maria Ionescu' }),
      profile: expect.objectContaining({
        email: 'maria.ionescu@example.ro',
        department: expect.objectContaining({ id: departmentId }),
      }),
    });
    const user = await userRow('maria.ionescu@example.ro');
    expect(user).toMatchObject({
      has_account: false,
      phone: '+40722000000',
      active_organization_id: organizationId,
    });
    expect(testApp.mailbox.sent).toHaveLength(0);
  });

  it('adds an Active volunteer and emails the invitation to install the app', async () => {
    const { body } = await add({ status: 'active' }, 201);
    expect(body.status).toBe('active');
    expect(body.profile.activeSince).toBeDefined();

    const invitation = testApp.mailbox.last('maria.ionescu@example.ro');
    expect(invitation.subject).toContain('Crucea te-a adăugat ca voluntar');
    expect(invitation.context.subtitle).toContain('Instalează aplicația VIC');
  });

  it('refuses the same email twice in one organization (VOLUNTEER_009), not in another one', async () => {
    await add({}, 201);
    const again = await add(
      { email: 'maria.ionescu@example.ro', status: 'active' },
      400,
    );
    expect(again.body.code_error).toBe('VOLUNTEER_009');
    expect(testApp.mailbox.sent).toHaveLength(0);

    // The other NGO reuses the same placeholder person.
    await add({ departmentId: otherDepartmentId }, 201, otherAdmin);
    const [{ count }] = await testApp.dataSource.query(
      `SELECT count(*)::int AS count FROM "user" WHERE email = 'maria.ionescu@example.ro'`,
    );
    expect(count).toBe(1);
  });

  it("refuses another organization's department and an invalid form", async () => {
    const res = await add({ departmentId: otherDepartmentId }, 400);
    expect(res.body.code_error).toBe('VOLUNTEER_PROFILE_002');

    await add({ status: 'blocked' }, 400);
    await add({ email: 'not-an-email' }, 400);
    await add({ firstName: 'M' }, 400);
    await add({ birthday: '2999-01-01' }, 400);
  });

  it('adds someone who already has a VIC account, and tells them to open the app', async () => {
    await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, first_name, last_name, email, has_account) VALUES ('regular', 'Maria I', 'Maria', 'I', 'maria.ionescu@example.ro', true)`,
    );
    await add({ status: 'active' }, 201);

    const [{ count }] = await testApp.dataSource.query(
      `SELECT count(*)::int AS count FROM "user" WHERE email = 'maria.ionescu@example.ro'`,
    );
    expect(count).toBe(1);
    expect(
      testApp.mailbox.last('maria.ionescu@example.ro').context.subtitle,
    ).toContain('Deschide aplicația VIC');
  });

  it('the person signs up in the app with that email and keeps the volunteer record', async () => {
    const { body: added } = await add({ status: 'active' }, 201);
    const identity = await testApp.app.get(AuthIdentityFacade).createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'maria.ionescu@example.ro',
      status: AuthIdentityStatus.ACTIVE,
    });

    await http()
      .post('/mobile/user')
      .set(
        'Authorization',
        `Bearer ${await testApp.mintAccessToken(identity, AuthRealm.MOBILE)}`,
      )
      .send({ firstName: 'Maria', lastName: 'Ionescu', birthday: '1995-04-12' })
      .expect(201);

    const user = await userRow('maria.ionescu@example.ro');
    expect(user.has_account).toBe(true);
    const [volunteer] = await testApp.dataSource.query(
      `SELECT user_id FROM volunteer WHERE id = $1`,
      [added.id],
    );
    expect(volunteer.user_id).toBe(user.id);
  });
});
