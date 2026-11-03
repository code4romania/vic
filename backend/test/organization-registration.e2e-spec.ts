import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { PasswordService } from 'src/modules/auth/services/password.service';
import { Test } from 'supertest';
import { api, linkSecret, refreshCookie } from './utils/http';
import { createTestApp, TestApp, TURNSTILE_OK } from './utils/test-app';
import { truncate } from './utils/test-data-source';

const PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj << >> endobj\ntrailer << >>\n%%EOF\n',
);
// A 1x1 transparent PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

// A new NGO from the registration form to validation, with the gates that hide it until then.
describe('Organization registration and validation (e2e)', () => {
  let testApp: TestApp;
  let http: ReturnType<typeof api>;
  let facade: AuthIdentityFacade;
  let superAdminToken: string;
  let volunteerToken: string;
  const ADMIN_EMAIL = 'ana@ong-nou.ro';
  const PASSWORD = 'Admin#2026x';

  const fields = (
    overrides: Record<string, string> = {},
  ): Record<string, string> => ({
    name: 'Asociatia Noua',
    email: 'contact@ong-nou.ro',
    phone: '+40700000100',
    address: 'Str. Exemplu 1, Iasi',
    activityArea: 'Educatie',
    description:
      'O asociatie noua care face educatie non-formala pentru copiii din mediul rural.',
    website: 'https://ong-nou.ro',
    taxId: 'RO12345678',
    firstName: 'Ana',
    lastName: 'Popescu',
    adminEmail: ADMIN_EMAIL,
    adminPhone: '+40711111100',
    password: PASSWORD,
    acceptedTerms: 'true',
    turnstileToken: TURNSTILE_OK,
    ...overrides,
  });

  const register = (
    overrides: Record<string, string> = {},
    files: {
      statute?: Buffer | false;
      statuteType?: string;
      logo?: Buffer;
    } = {},
  ): Test => {
    let req = http.post('/organizations/register');
    for (const [key, value] of Object.entries(fields(overrides))) {
      req = req.field(key, value);
    }
    if (files.statute !== false) {
      req = req.attach('statute', files.statute ?? PDF, {
        filename: 'statut.pdf',
        contentType: files.statuteType ?? 'application/pdf',
      });
    }
    if (files.logo) {
      req = req.attach('logo', files.logo, {
        filename: 'logo.png',
        contentType: 'image/png',
      });
    }
    return req;
  };

  const organizationRow = async (): Promise<Record<string, unknown>> =>
    (
      await testApp.dataSource.query(
        `SELECT id, status, validated_at, statute_url, logo FROM organization WHERE lower(name) = 'asociatia noua'`,
      )
    )[0];

  const mobileOrganizationNames = async (): Promise<string[]> =>
    (
      await http
        .get('/mobile/organization')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(200)
    ).body.items.map((item: { name: string }) => item.name);

  // Registered and confirmed: active, logged in, not validated yet.
  const registeredAndConfirmed = async (): Promise<{
    accessToken: string;
    cookie: string;
  }> => {
    await register().expect(201);
    const confirmed = await http
      .post('/auth/confirm-email')
      .send({ token: linkSecret(testApp.mailbox.last(ADMIN_EMAIL)) })
      .expect(200);
    return {
      accessToken: confirmed.body.accessToken,
      cookie: refreshCookie(confirmed).split(';')[0],
    };
  };

  beforeAll(async () => {
    testApp = await createTestApp();
    http = api(testApp.app);
    facade = testApp.app.get(AuthIdentityFacade);
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, [
      'auth_identity',
      'user',
      'organization',
      'actions_archive',
    ]);
    // A VIC super admin (in a validated NGO of their own) and a volunteer with no profile.
    const [org] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('VIC', 'vic@commitglobal.org', '+40700000001', 'active', now()) RETURNING id`,
    );
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Super Admin', 'super@vic.ro', '+40700000002', $1) RETURNING id`,
      [org.id],
    );
    const superAdmin = await facade.createIdentity({
      realm: AuthRealm.WEB,
      email: 'super@vic.ro',
      status: AuthIdentityStatus.ACTIVE,
      superAdmin: true,
      userId: user.id,
      emailVerifiedAt: new Date(),
    });
    superAdminToken = await testApp.mintAccessToken(superAdmin, AuthRealm.WEB);
    const volunteer = await facade.createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'elena@example.ro',
      status: AuthIdentityStatus.ACTIVE,
    });
    volunteerToken = await testApp.mintAccessToken(volunteer, AuthRealm.MOBILE);
    testApp.mailbox.clear();
  });

  it('refuses a failed anti-robot check (ORG_006), a missing or non-PDF statute (ORG_007), unaccepted terms', async () => {
    expect(
      (await register({ turnstileToken: 'bot' }).expect(400)).body.code_error,
    ).toBe('ORG_006');
    expect(
      (await register({}, { statute: false }).expect(400)).body.code_error,
    ).toBe('ORG_007');
    expect(
      (
        await register(
          {},
          { statute: Buffer.from('not a pdf'), statuteType: 'application/pdf' },
        ).expect(400)
      ).body.code_error,
    ).toBe('ORG_007');
    await register({ acceptedTerms: 'false' }).expect(400);

    const [{ count }] = await testApp.dataSource.query(
      `SELECT count(*)::int AS count FROM organization`,
    );
    expect(count).toBe(1);
    expect(testApp.mailbox.sent).toHaveLength(0);
  });

  it('registers a pending NGO with its files; it is hidden and its admin cannot log in before confirming', async () => {
    const res = await register({}, { logo: PNG }).expect(201);
    expect(res.body).toEqual({ maskedEmail: 'a•••@ong-nou.ro' });

    const organization = await organizationRow();
    expect(organization.status).toBe('pending');
    expect(organization.validated_at).toBeNull();
    expect(organization.statute_url).toMatch(
      new RegExp(`^organizations/${organization.id}/.+statute\\.pdf$`),
    );
    // The logo is a public URL (local S3 emulator here); it serves the uploaded image.
    expect(organization.logo).toMatch(
      new RegExp(
        `^http://localhost:9090/vic-local-public/organizations/${organization.id}/`,
      ),
    );
    const logo = await fetch(organization.logo as string);
    expect(logo.status).toBe(200);
    expect(Buffer.from(await logo.arrayBuffer()).equals(PNG)).toBe(true);

    expect(testApp.mailbox.last(ADMIN_EMAIL).subject).toContain(
      'Activează Asociatia Noua',
    );
    expect(await mobileOrganizationNames()).not.toContain('Asociatia Noua');

    const login = await http
      .post('/auth/web/login')
      .send({ email: ADMIN_EMAIL, password: PASSWORD })
      .expect(403);
    expect(login.body.code_error).toBe('AUTH_003');
  });

  it('refuses a duplicate name, email, phone or tax id ignoring case, and a taken admin email: 409 ORG_004', async () => {
    await register().expect(201);

    for (const overrides of [
      {
        name: 'ASOCIATIA NOUA',
        email: 'x1@x.ro',
        phone: '+40799999991',
        taxId: '11111111',
        adminEmail: 'x1@a.ro',
      },
      {
        name: 'Alt nume 1',
        email: 'CONTACT@ONG-NOU.RO',
        phone: '+40799999992',
        taxId: '22222222',
        adminEmail: 'x2@a.ro',
      },
      {
        name: 'Alt nume 2',
        email: 'x3@x.ro',
        phone: '+40700000100',
        taxId: '33333333',
        adminEmail: 'x3@a.ro',
      },
      {
        name: 'Alt nume 3',
        email: 'x4@x.ro',
        phone: '+40799999994',
        taxId: 'ro12345678',
        adminEmail: 'x4@a.ro',
      },
      {
        name: 'Alt nume 4',
        email: 'x5@x.ro',
        phone: '+40799999995',
        taxId: '55555555',
        adminEmail: ADMIN_EMAIL,
      },
    ]) {
      const res = await register(overrides).expect(409);
      expect(res.body.code_error).toBe('ORG_004');
    }
  });

  it('confirming activates the NGO, logs the admin in and tells the super admins, statute link included', async () => {
    const { accessToken, cookie } = await registeredAndConfirmed();
    expect(cookie).toMatch(/^vic_refresh=/);

    const organization = await organizationRow();
    expect(organization.status).toBe('active');
    expect(organization.validated_at).toBeNull();

    const notice = testApp.mailbox.last('super@vic.ro');
    expect(notice.subject).toContain('ONG nou de validat: Asociatia Noua');
    expect(notice.context.subtitle).toContain('RO12345678');
    const statute = await fetch(notice.context.cta.link);
    expect(statute.status).toBe(200);
    expect(Buffer.from(await statute.arrayBuffer()).equals(PDF)).toBe(true);

    const own = await http
      .get('/organization')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(own.body).toMatchObject({
      status: 'active',
      validatedAt: null,
      taxId: 'RO12345678',
    });
    expect(own.body.statuteUrl).toMatch(/^http/);
  });

  it('a confirmed but unvalidated NGO is hidden from volunteers and its admin gets 403 ORG_005 on an event', async () => {
    const { accessToken } = await registeredAndConfirmed();

    expect(await mobileOrganizationNames()).not.toContain('Asociatia Noua');
    // Multipart, as the web app sends it (the event controller expects the files object).
    const event = await http
      .post('/event')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('name', 'Eveniment')
      .field('description', 'Un eveniment de test')
      .field('startDate', new Date(Date.now() + 86400000).toISOString())
      .field('status', 'draft')
      .field('isPublic', 'public')
      .field('attendanceType', 'simple')
      .field('tasksIds[]', '00000000-0000-4000-8000-000000000000')
      .expect(403);
    expect(event.body.code_error).toBe('ORG_005');
  });

  it('only super admins see the review page; validating makes the NGO visible and emails its admins', async () => {
    const { accessToken } = await registeredAndConfirmed();
    const organization = await organizationRow();

    await http
      .get('/admin/organizations/pending-validation')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);

    const pending = await http
      .get('/admin/organizations/pending-validation')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);
    expect(pending.body).toHaveLength(1);
    expect(pending.body[0]).toMatchObject({
      id: organization.id,
      taxId: 'RO12345678',
      firstAdmin: expect.objectContaining({ email: ADMIN_EMAIL }),
    });
    expect(pending.body[0].statuteUrl).toMatch(/^http/);

    testApp.mailbox.clear();
    await http
      .patch(`/admin/organizations/${organization.id}/validate`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    expect(await mobileOrganizationNames()).toContain('Asociatia Noua');
    expect(testApp.mailbox.last(ADMIN_EMAIL).subject).toContain(
      'a fost validată',
    );
    const again = await http
      .get('/admin/organizations/pending-validation')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);
    expect(again.body).toHaveLength(0);
  });

  it('suspend blocks the admins without touching their status; unsuspend restores exactly who could log in', async () => {
    const { cookie } = await registeredAndConfirmed();
    const organization = await organizationRow();
    await http
      .patch(`/admin/organizations/${organization.id}/validate`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);
    // A second admin, disabled on the Team page before the suspension.
    const [colleague] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Fost Coleg', 'fost@ong-nou.ro', '+40711111199', $1) RETURNING id`,
      [organization.id],
    );
    const disabled: IAuthIdentityModel = await facade.createIdentity({
      realm: AuthRealm.WEB,
      email: 'fost@ong-nou.ro',
      status: AuthIdentityStatus.DISABLED,
      passwordHash: await testApp.app.get(PasswordService).hash(PASSWORD),
      emailVerifiedAt: new Date(),
      userId: colleague.id,
    });

    await http
      .patch(`/admin/organizations/${organization.id}/suspend`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    expect(await mobileOrganizationNames()).not.toContain('Asociatia Noua');
    const blocked = await http
      .post('/auth/web/login')
      .send({ email: ADMIN_EMAIL, password: PASSWORD })
      .expect(403);
    expect(blocked.body.code_error).toBe('AUTH_004');
    await http.post('/auth/web/refresh').set('Cookie', cookie).expect(401);
    const statuses = await testApp.dataSource.query(
      `SELECT email, status FROM auth_identity WHERE email IN ($1, $2) ORDER BY email`,
      [ADMIN_EMAIL, 'fost@ong-nou.ro'],
    );
    expect(statuses).toEqual([
      { email: ADMIN_EMAIL, status: 'active' },
      { email: 'fost@ong-nou.ro', status: 'disabled' },
    ]);

    await http
      .patch(`/admin/organizations/${organization.id}/unsuspend`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    await http
      .post('/auth/web/login')
      .send({ email: ADMIN_EMAIL, password: PASSWORD })
      .expect(200);
    expect(
      (
        await http
          .post('/auth/web/login')
          .send({ email: disabled.email, password: PASSWORD })
          .expect(403)
      ).body.code_error,
    ).toBe('AUTH_004');
    expect(await mobileOrganizationNames()).toContain('Asociatia Noua');
  });
});
