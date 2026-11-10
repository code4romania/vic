import { AuthCleanupProcessor } from 'src/modules/auth/jobs/auth-cleanup.processor';
import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { Test } from 'supertest';
import { api, asWeb, linkSecret, refreshCookie } from './utils/http';
import { createTestApp, TestApp, TURNSTILE_OK } from './utils/test-app';
import { truncate } from './utils/test-data-source';

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

  const fields = (
    overrides: Record<string, string> = {},
  ): Record<string, string> => ({
    name: 'Asociatia Noua',
    email: 'contact@ong-nou.ro',
    phone: '+40700000100',
    // #469: only the minimum; description, address, website and logo come later
    taxId: 'RO12345674',
    firstName: 'Ana',
    lastName: 'Popescu',
    adminEmail: ADMIN_EMAIL,
    adminPhone: '+40711111100',
    acceptedTerms: 'true',
    declaresRegisteredNgo: 'true',
    declaresRepresentative: 'true',
    turnstileToken: TURNSTILE_OK,
    ...overrides,
  });

  const register = (
    overrides: Record<string, string> = {},
    files: { logo?: Buffer } = {},
  ): Test => {
    let req = http.post('/organizations/register');
    for (const [key, value] of Object.entries(fields(overrides))) {
      req = req.field(key, value);
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
        `SELECT id, status, validated_at, self_declared_at, description, address, website, logo FROM organization WHERE lower(name) = 'asociatia noua'`,
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

  it('the confirm-email session counts as a login (lastLoginAt)', async () => {
    await registeredAndConfirmed();

    const identity = await facade.findIdentity({
      realm: AuthRealm.WEB,
      email: ADMIN_EMAIL,
    });
    expect(identity.lastLoginAt).toBeInstanceOf(Date);
  });

  it('refuses a failed anti-robot check (ORG_006), a missing CUI, a short description, unaccepted terms', async () => {
    expect(
      (await register({ turnstileToken: 'bot' }).expect(400)).body.code_error,
    ).toBe('ORG_006');
    await register({ taxId: '' }).expect(400);
    // M9: the CUI check digit
    await register({ taxId: 'RO12345678' }).expect(400);
    await register({ description: 'prea scurta' }).expect(400);
    await register({ acceptedTerms: 'false' }).expect(400);
    // #510: both self-declarations are required
    await register({ declaresRegisteredNgo: 'false' }).expect(400);
    await register({ declaresRepresentative: 'false' }).expect(400);

    const [{ count }] = await testApp.dataSource.query(
      `SELECT count(*)::int AS count FROM organization`,
    );
    expect(count).toBe(1);
    expect(testApp.mailbox.sent).toHaveLength(0);
  });

  it('registers a pending NGO with only the minimum, and no statute', async () => {
    await register().expect(201);

    const organization = await organizationRow();
    expect(organization).toMatchObject({
      status: 'pending',
      description: null,
      address: null,
      website: null,
      logo: null,
    });
    // #510: the self-declaration is recorded, the statute is no longer asked for
    expect(organization.self_declared_at).toBeInstanceOf(Date);
    expect(organization).not.toHaveProperty('statute_url');
  });

  it('registers a pending NGO with its logo; it is hidden and its admin cannot log in before confirming', async () => {
    const res = await register({}, { logo: PNG }).expect(201);
    expect(res.body).toEqual({ maskedEmail: 'a•••@ong-nou.ro' });

    const organization = await organizationRow();
    expect(organization.status).toBe('pending');
    expect(organization.validated_at).toBeNull();
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

    // Asking for a login link before confirming sends the confirmation link again: it is what activates
    // the organization (VIC 2.0, #514: no password).
    testApp.mailbox.clear();
    await testApp.flushRedis();
    await http
      .post('/auth/web/login/request')
      .send({ email: ADMIN_EMAIL })
      .expect(204);
    expect(testApp.mailbox.last(ADMIN_EMAIL).subject).toContain(
      'Activează Asociatia Noua',
    );
  });

  it('refuses a duplicate name, email, phone or tax id ignoring case, and a taken admin email: 409 ORG_004', async () => {
    await register().expect(201);

    for (const overrides of [
      {
        name: 'ASOCIATIA NOUA',
        email: 'x1@x.ro',
        phone: '+40799999991',
        taxId: '11111110',
        adminEmail: 'x1@a.ro',
      },
      {
        name: 'Alt nume 1',
        email: 'CONTACT@ONG-NOU.RO',
        phone: '+40799999992',
        taxId: '22222229',
        adminEmail: 'x2@a.ro',
      },
      {
        name: 'Alt nume 2',
        email: 'x3@x.ro',
        phone: '+40700000100',
        taxId: '33333338',
        adminEmail: 'x3@a.ro',
      },
      {
        name: 'Alt nume 3',
        email: 'x4@x.ro',
        phone: '+40799999994',
        taxId: 'ro 0012345674',
        adminEmail: 'x4@a.ro',
      },
      {
        name: 'Alt nume 4',
        email: 'x5@x.ro',
        phone: '+40799999995',
        taxId: '55555556',
        adminEmail: ADMIN_EMAIL,
      },
    ]) {
      const res = await register(overrides).expect(409);
      expect(res.body.code_error).toBe('ORG_004');
    }
  });

  it('confirming activates the NGO, logs the admin in and tells the super admins, with a link to the validation page', async () => {
    const { accessToken, cookie } = await registeredAndConfirmed();
    expect(cookie).toMatch(/^vic_refresh=/);

    const organization = await organizationRow();
    expect(organization.status).toBe('active');
    expect(organization.validated_at).toBeNull();

    const notice = testApp.mailbox.last('super@vic.ro');
    expect(notice.subject).toContain('ONG nou de validat: Asociatia Noua');
    expect(notice.context.subtitle).toContain('CUI 12345674');
    expect(notice.context.cta.link).toBe('https://vic.test/admin/validation');

    const own = await http
      .get('/organization')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(own.body).toMatchObject({
      status: 'active',
      validatedAt: null,
      // M9: stored normalized
      taxId: '12345674',
    });
    expect(own.body).not.toHaveProperty('statuteUrl');
    expect(own.body).not.toHaveProperty('activityArea');
  });

  it('a confirmed but unvalidated NGO is hidden from volunteers and its admin gets 403 ORG_005 on an event', async () => {
    const { accessToken } = await registeredAndConfirmed();

    expect(await mobileOrganizationNames()).not.toContain('Asociatia Noua');
    // JSON, as the web app sends it since the poster was removed (#492).
    const event = await http
      .post('/event')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Eveniment',
        description: 'Un eveniment de test',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'draft',
        isPublic: 'public',
      })
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
      taxId: '12345674',
      firstAdmin: expect.objectContaining({ email: ADMIN_EMAIL }),
    });
    expect(pending.body[0]).not.toHaveProperty('statuteUrl');

    testApp.mailbox.clear();
    await http
      .patch(`/admin/organizations/${organization.id}/validate`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    expect(await mobileOrganizationNames()).toContain('Asociatia Noua');
    const validatedMail = testApp.mailbox.last(ADMIN_EMAIL);
    expect(validatedMail.subject).toContain('a fost validată');
    expect(validatedMail.context.cta.link).toBe('https://vic.test/login');
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
      emailVerifiedAt: new Date(),
      userId: colleague.id,
    });

    await http
      .patch(`/admin/organizations/${organization.id}/suspend`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    expect(await mobileOrganizationNames()).not.toContain('Asociatia Noua');
    await testApp.flushRedis();
    await http
      .post('/auth/web/login/request')
      .send({ email: ADMIN_EMAIL })
      .expect(204);
    const blocked = await http
      .post('/auth/login-link')
      .send({ token: linkSecret(testApp.mailbox.last(ADMIN_EMAIL)) })
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

    await asWeb(testApp, http, ADMIN_EMAIL);
    testApp.mailbox.clear();
    await http
      .post('/auth/web/login/request')
      .send({ email: disabled.email })
      .expect(204);
    expect(testApp.mailbox.to(disabled.email)).toHaveLength(0);
    expect(await mobileOrganizationNames()).toContain('Asociatia Noua');
  });
  it('a registration never confirmed is removed by the daily cleanup after 7 days, files included, and the name is free again', async () => {
    await register({}, { logo: PNG }).expect(201);
    const organization = await organizationRow();
    expect((await fetch(organization.logo as string)).status).toBe(200);

    const cleanup = testApp.app.get(AuthCleanupProcessor);
    expect((await cleanup.run()).pendingOrganizations).toBe(0);

    await testApp.dataSource.query(
      `UPDATE organization SET created_on = now() - interval '8 days' WHERE id = $1`,
      [organization.id],
    );
    expect((await cleanup.run()).pendingOrganizations).toBe(1);

    expect(await organizationRow()).toBeUndefined();
    expect(
      await facade.findIdentity({ realm: AuthRealm.WEB, email: ADMIN_EMAIL }),
    ).toBeNull();
    const [{ count }] = await testApp.dataSource.query(
      `SELECT count(*)::int AS count FROM "user" WHERE lower(email) = $1`,
      [ADMIN_EMAIL],
    );
    expect(count).toBe(0);
    // The public logo is gone from the bucket (local S3 emulator).
    expect((await fetch(organization.logo as string)).status).toBe(404);

    testApp.mailbox.clear();
    await register().expect(201);
  });

  it('M9: the CUI can change until the NGO is validated, then it is locked', async () => {
    const { accessToken } = await registeredAndConfirmed();
    const patch = (taxId: string): Test =>
      http
        .patch('/organization')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('taxId', taxId);

    expect((await patch('RO 18547290').expect(200)).body.taxId).toBe(
      '18547290',
    );
    await patch('18547291').expect(400);

    const { id } = await organizationRow();
    await testApp.dataSource.query(
      `UPDATE organization SET validated_at = now() WHERE id = $1`,
      [id],
    );
    const locked = await patch('12345674').expect(400);
    expect(locked.body.code_error).toBe('ORG_012');
    // the same CUI, spelled differently, is not a change
    await patch('RO018547290').expect(200);
    const [row] = await testApp.dataSource.query(
      `SELECT tax_id FROM organization WHERE id = $1`,
      [id],
    );
    expect(row.tax_id).toBe('18547290');
  });
});
