import { Response } from 'supertest';
import { AuthExceptionCodes } from 'src/modules/auth/exceptions/exceptions';
import {
  FAKE_NGOHUB_CLIENT_ID,
  FAKE_NGOHUB_CLIENT_SECRET,
  FakeNgoHub,
  FakeNgoHubUser,
  fakeOrganization,
} from './utils/fake-ngohub';
import { api, linkSecret, refreshCookie } from './utils/http';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

const REDIRECT_URI = 'https://vic.test/login/ngohub/callback';
const CUI = '12345678';

// Login with NGO Hub, issue 03: the scenarios of the plan's 2.6 through the API, against a fake NGO Hub.
describe('Login with NGO Hub (e2e)', () => {
  let ngohub: FakeNgoHub;
  let testApp: TestApp;
  let http: ReturnType<typeof api>;

  const flowCookie = (response: Response): string =>
    []
      .concat(response.headers['set-cookie'] ?? [])
      .find((value: string) => value.startsWith('vic_ngohub_flow='))
      ?.split(';')[0];

  // The browser's round trip: /start, NGO Hub, then the web app posting the callback with the cookie.
  const loginAs = async (
    user: FakeNgoHubUser | null,
  ): Promise<Response & { cookie: string }> => {
    ngohub.loginAs = user;
    const start = await http.get('/auth/web/ngohub/start').expect(302);
    const cookie = flowCookie(start);
    const params = await ngohub.authorize(start.headers.location);
    const response = await http
      .post('/auth/web/ngohub/callback')
      .set('Cookie', cookie)
      .send(params);
    return Object.assign(response, { cookie });
  };

  const organization = async (
    fields: { taxId?: string; ngohubId?: number; status?: string } = {},
  ): Promise<string> =>
    (
      await testApp.dataSource.query(
        `INSERT INTO organization (name, email, phone, status, tax_id, ngohub_organization_id, validated_at)
         VALUES ('Asociatia VIC', 'org@vic.ro', '+40700000001', $1, $2, $3, now()) RETURNING id`,
        [
          fields.status ?? 'active',
          fields.taxId ?? null,
          fields.ngohubId ?? null,
        ],
      )
    )[0].id;

  const admin = async (
    organizationId: string,
    email: string,
    status = 'active',
  ): Promise<{ userId: string; identityId: string }> => {
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Admin VIC', $1, '+40711111111', $2) RETURNING id`,
      [email, organizationId],
    );
    const [identity] = await testApp.dataSource.query(
      `INSERT INTO auth_identity (user_id, realm, email, status, email_verified_at)
       VALUES ($1, 'web', $2, $3, ${status === 'pending' ? 'NULL' : 'now()'}) RETURNING id`,
      [user.id, email, status],
    );
    return { userId: user.id, identityId: identity.id };
  };

  const ngohubAdmin = (
    overrides: Partial<FakeNgoHubUser> = {},
  ): FakeNgoHubUser => ({
    sub: '17',
    email: 'ana@ngo.ro',
    name: 'Ana Pop',
    organization: fakeOrganization({ id: 501, cui: `RO ${CUI}` }),
    ...overrides,
  });

  const links = (): Promise<{ subject: string; identity_id: string }[]> =>
    testApp.dataSource.query(
      `SELECT subject, identity_id FROM auth_identity_provider WHERE provider = 'ngohub'`,
    );

  const count = async (table: string): Promise<number> =>
    (
      await testApp.dataSource.query(
        `SELECT count(*)::int AS n FROM "${table}"`,
      )
    )[0].n;

  const errorOf = (response: Response): string => response.body.code_error;

  beforeAll(async () => {
    ngohub = await new FakeNgoHub().start();
    testApp = await createTestApp({
      authConfig: {
        NGOHUB_ISSUER: ngohub.issuer,
        NGOHUB_CLIENT_ID: FAKE_NGOHUB_CLIENT_ID,
        NGOHUB_CLIENT_SECRET: FAKE_NGOHUB_CLIENT_SECRET,
        NGOHUB_REDIRECT_URI: REDIRECT_URI,
      },
    });
    http = api(testApp.app);
  });

  afterAll(async () => {
    await testApp?.close();
    await ngohub?.stop();
  });

  beforeEach(async () => {
    ngohub.reset();
    ngohub.redirectUris = [REDIRECT_URI];
    testApp.mailbox.clear();
    await testApp.flushRedis();
    await truncate(testApp.dataSource, [
      'auth_identity',
      'user',
      'organization',
      'actions_archive',
    ]);
  });

  describe('start', () => {
    it('sets the flow cookie, scoped to the NGO Hub routes, and redirects to NGO Hub', async () => {
      const response = await http
        .get('/auth/web/ngohub/start?prompt=login')
        .expect(302);
      expect(
        response.headers.location.startsWith(`${ngohub.issuer}/oidc/auth?`),
      ).toBe(true);
      expect(
        new URL(response.headers.location).searchParams.get('prompt'),
      ).toBe('login');
      const cookie = [].concat(response.headers['set-cookie']).join(';');
      expect(cookie).toMatch(
        /vic_ngohub_flow=[^;]+;.*Path=\/auth\/web\/ngohub/,
      );
      expect(cookie).toMatch(/HttpOnly/);
      expect(cookie).toMatch(/SameSite=Lax/);
    });
  });

  describe('an existing VIC login', () => {
    it('found by email in the organization with the same CUI: logged in, linked, organization linked', async () => {
      const organizationId = await organization({ taxId: CUI });
      const { identityId } = await admin(
        organizationId,
        'ana@ngo.ro',
        'pending',
      );

      const response = await loginAs(ngohubAdmin());

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe('ana@ngo.ro');
      expect(refreshCookie(response)).toBeDefined();
      expect(await links()).toEqual([
        { subject: '17', identity_id: identityId },
      ]);
      const [row] = await testApp.dataSource.query(
        `SELECT i.status, i.email_verified_at IS NOT NULL AS verified, o.ngohub_organization_id
           FROM auth_identity i, organization o WHERE i.id = $1 AND o.id = $2`,
        [identityId, organizationId],
      );
      expect(row).toEqual({
        status: 'active',
        verified: true,
        ngohub_organization_id: 501,
      });
      expect(testApp.mailbox.sent).toHaveLength(0);
    });

    it('linked before: found by the NGO Hub account even after the email changed there', async () => {
      const organizationId = await organization({ taxId: CUI });
      await admin(organizationId, 'ana@ngo.ro');
      expect((await loginAs(ngohubAdmin())).status).toBe(200);

      const again = await loginAs(ngohubAdmin({ email: 'ana.noua@ngo.ro' }));
      expect(again.status).toBe(200);
      expect(again.body.user.email).toBe('ana@ngo.ro');
      expect(await links()).toHaveLength(1);
    });

    it('already linked to another NGO Hub account: AUTH_018', async () => {
      const organizationId = await organization({ taxId: CUI });
      await admin(organizationId, 'ana@ngo.ro');
      await loginAs(ngohubAdmin());

      const other = await loginAs(ngohubAdmin({ sub: '99' }));
      expect(other.status).toBe(409);
      expect(errorOf(other)).toBe(AuthExceptionCodes.AUTH_018);
    });

    it('of another organization: AUTH_016, nothing linked', async () => {
      const organizationId = await organization({ taxId: '87654321' });
      await admin(organizationId, 'ana@ngo.ro');

      const response = await loginAs(ngohubAdmin());
      expect(response.status).toBe(403);
      expect(errorOf(response)).toBe(AuthExceptionCodes.AUTH_016);
      expect(await links()).toEqual([]);
    });

    it('disabled, or of a suspended organization: AUTH_004', async () => {
      const organizationId = await organization({ taxId: CUI });
      await admin(organizationId, 'ana@ngo.ro', 'disabled');
      expect(errorOf(await loginAs(ngohubAdmin()))).toBe(
        AuthExceptionCodes.AUTH_004,
      );

      await truncate(testApp.dataSource, [
        'auth_identity',
        'user',
        'organization',
      ]);
      const suspended = await organization({ taxId: CUI, status: 'suspended' });
      await admin(suspended, 'ana@ngo.ro');
      expect(errorOf(await loginAs(ngohubAdmin()))).toBe(
        AuthExceptionCodes.AUTH_004,
      );
    });
  });

  describe('no VIC login, an organization VIC knows', () => {
    it('an NGO Hub admin joins as admin; the other admins can say "it was not us"', async () => {
      const organizationId = await organization({ taxId: CUI });
      await admin(organizationId, 'veche@vic.ro');

      const response = await loginAs(ngohubAdmin());
      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        email: 'ana@ngo.ro',
        name: 'Ana Pop',
      });
      const accessToken = response.body.accessToken;

      const [joined] = await testApp.dataSource.query(
        `SELECT u.organization_id, i.status FROM "user" u JOIN auth_identity i ON i.user_id = u.id
          WHERE u.email = 'ana@ngo.ro' AND u.type = 'admin'`,
      );
      expect(joined).toEqual({
        organization_id: organizationId,
        status: 'active',
      });

      const email = testApp.mailbox.last('veche@vic.ro');
      expect(email.subject).toContain('NGO Hub');
      expect(testApp.mailbox.to('ana@ngo.ro')).toHaveLength(0);

      for (let i = 0; i < 50 && (await count('actions_archive')) === 0; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      const [history] = await testApp.dataSource.query(
        `SELECT event_name, event_data FROM actions_archive`,
      );
      expect(history).toMatchObject({
        event_name: 'NGOHUB_ADMIN_JOINED',
        event_data: {
          adminName: 'Ana Pop',
          ngohubOrganizationId: 501,
          taxId: CUI,
        },
      });

      // "It was not us": the new admin is out at once, and the link works once.
      const secret = linkSecret(email);
      await http
        .post('/auth/web/ngohub/not-us')
        .send({ token: secret })
        .expect(204);
      await http
        .get('/auth/web/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
      expect(errorOf(await loginAs(ngohubAdmin()))).toBe(
        AuthExceptionCodes.AUTH_004,
      );
      const reused = await http
        .post('/auth/web/ngohub/not-us')
        .send({ token: secret });
      expect(errorOf(reused)).toBe(AuthExceptionCodes.AUTH_005);
    });

    it('the "it was not us" link is neither a login link nor resendable', async () => {
      const organizationId = await organization({ taxId: CUI });
      await admin(organizationId, 'veche@vic.ro');
      await loginAs(ngohubAdmin());
      const secret = linkSecret(testApp.mailbox.last('veche@vic.ro'));
      testApp.mailbox.clear();

      const login = await http.post('/auth/login-link').send({ token: secret });
      expect(login.status).toBeGreaterThanOrEqual(400);
      await http.post(`/auth/token/${secret}/resend`);
      expect(testApp.mailbox.sent).toHaveLength(0);
      await http
        .post('/auth/web/ngohub/not-us')
        .send({ token: secret })
        .expect(204);
    });

    it('found by its NGO Hub id even when the CUI differs', async () => {
      const organizationId = await organization({
        taxId: '87654321',
        ngohubId: 501,
      });
      const response = await loginAs(ngohubAdmin());
      expect(response.status).toBe(200);
      const [user] = await testApp.dataSource.query(
        `SELECT organization_id FROM "user" WHERE email = 'ana@ngo.ro'`,
      );
      expect(user.organization_id).toBe(organizationId);
    });

    it('an employee is told to ask for an invite (AUTH_017) and nothing is created', async () => {
      await organization({ taxId: CUI });
      const users = await count('user');

      const response = await loginAs(
        ngohubAdmin({
          organization: fakeOrganization({ cui: CUI, role: 'employee' }),
        }),
      );
      expect(response.status).toBe(403);
      expect(errorOf(response)).toBe(AuthExceptionCodes.AUTH_017);
      expect(await count('user')).toBe(users);
      expect(await count('auth_identity_provider')).toBe(0);
    });

    it('a volunteer login in the app with the same email does not block', async () => {
      await organization({ taxId: CUI });
      const [volunteer] = await testApp.dataSource.query(
        `INSERT INTO "user" (type, name, email, phone, first_name, last_name)
         VALUES ('regular', 'Ana Pop', 'ana@ngo.ro', '+40722222222', 'Ana', 'Pop') RETURNING id`,
      );
      await testApp.dataSource.query(
        `INSERT INTO auth_identity (user_id, realm, email, status) VALUES ($1, 'mobile', 'ana@ngo.ro', 'active')`,
        [volunteer.id],
      );

      expect((await loginAs(ngohubAdmin())).status).toBe(200);
    });
  });

  describe('no VIC login, an organization VIC does not know', () => {
    it('an admin gets a registration ticket and the prefilled form; the cookie lives as long as the ticket', async () => {
      const response = await loginAs(ngohubAdmin());

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeUndefined();
      expect(response.body.registration.ticket).toMatch(/^[\w-]{43}$/);
      expect(response.body.registration.prefill).toEqual({
        organization: {
          name: 'Asociatia din NGO Hub',
          taxId: CUI,
          email: 'contact@ngohub-org.ro',
          phone: '+40712345678',
          address: 'Str. Exemplu 1, Cluj-Napoca, jud. Cluj',
          description: 'Descriere scurtă',
          website: 'https://ngohub-org.ro',
          logoUrl: null,
        },
        admin: { email: 'ana@ngo.ro', firstName: 'Ana', lastName: 'Pop' },
      });
      const cookie = [].concat(response.headers['set-cookie']).join(';');
      expect(cookie).toMatch(/vic_ngohub_flow=[^;]+;\s*Max-Age=1800/);
      expect(await count('organization')).toBe(0);
    });

    it('an employee is refused (AUTH_017)', async () => {
      const response = await loginAs(
        ngohubAdmin({ organization: fakeOrganization({ role: 'employee' }) }),
      );
      expect(errorOf(response)).toBe(AuthExceptionCodes.AUTH_017);
    });
  });

  it('refuses an NGO Hub account whose email is not verified (AUTH_013)', async () => {
    await organization({ taxId: CUI });
    const response = await loginAs(ngohubAdmin({ email_verified: false }));
    expect(errorOf(response)).toBe(AuthExceptionCodes.AUTH_013);
  });

  it('refuses the callback without the flow cookie (AUTH_019)', async () => {
    ngohub.loginAs = ngohubAdmin();
    const start = await http.get('/auth/web/ngohub/start').expect(302);
    const params = await ngohub.authorize(start.headers.location);
    const response = await http.post('/auth/web/ngohub/callback').send(params);
    expect(response.status).toBe(401);
    expect(errorOf(response)).toBe(AuthExceptionCodes.AUTH_019);
  });

  describe('registering an NGO from NGO Hub', () => {
    const form = {
      email: 'contact@ngohub-org.ro',
      phone: '+40712345678',
      address: 'Str. Exemplu 1, Cluj-Napoca',
      website: 'https://ngohub-org.ro',
      firstName: 'Ana',
      lastName: 'Pop',
      adminPhone: '+40711111112',
      acceptedTerms: 'true',
    };

    const register = (
      ticket: string,
      cookie: string,
      fields: Record<string, string> = {},
    ): Promise<Response> => {
      let request = http
        .post('/auth/web/ngohub/register')
        .set('Cookie', cookie);
      for (const [key, value] of Object.entries({
        ...form,
        ticket,
        ...fields,
      })) {
        request = request.field(key, value);
      }
      return request;
    };

    const ticketFor = async (
      user: FakeNgoHubUser = ngohubAdmin(),
    ): Promise<{ ticket: string; cookie: string }> => {
      const response = await loginAs(user);
      expect(response.status).toBe(200);
      return {
        ticket: response.body.registration.ticket,
        cookie: response.cookie,
      };
    };

    it('creates the NGO active and validated, from the ticket, and logs the admin in', async () => {
      const { ticket, cookie } = await ticketFor();

      // The locked fields sent in the body are dropped: the ticket decides.
      const response = await register(ticket, cookie, {
        name: 'Alt Nume',
        taxId: '87654321',
        adminEmail: 'altcineva@ngo.ro',
      });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe('ana@ngo.ro');
      expect(refreshCookie(response)).toBeDefined();
      const [organization] = await testApp.dataSource.query(
        `SELECT name, tax_id, status, validated_at IS NOT NULL AS validated,
                self_declared_at, ngohub_organization_id, email, logo
           FROM organization`,
      );
      expect(organization).toEqual({
        name: 'Asociatia din NGO Hub',
        tax_id: CUI,
        status: 'active',
        validated: true,
        self_declared_at: null,
        ngohub_organization_id: 501,
        email: 'contact@ngohub-org.ro',
        logo: null,
      });
      const [identity] = await testApp.dataSource.query(
        `SELECT i.status, i.email, u.phone FROM auth_identity i JOIN "user" u ON u.id = i.user_id`,
      );
      expect(identity).toEqual({
        status: 'active',
        email: 'ana@ngo.ro',
        phone: '+40711111112',
      });
      expect(await links()).toHaveLength(1);

      // Next time the same NGO Hub account just logs in.
      expect((await loginAs(ngohubAdmin())).body.accessToken).toBeDefined();
    });

    it('refuses a ticket used twice, or from another browser (AUTH_019)', async () => {
      const { ticket, cookie } = await ticketFor();
      const other = await register(ticket, 'vic_ngohub_flow=someone-else');
      expect(errorOf(other)).toBe(AuthExceptionCodes.AUTH_019);
      // The failed attempt used it up as well.
      expect(errorOf(await register(ticket, cookie))).toBe(
        AuthExceptionCodes.AUTH_019,
      );

      const fresh = await ticketFor();
      expect((await register(fresh.ticket, fresh.cookie)).status).toBe(200);
      const again = await register(fresh.ticket, fresh.cookie);
      expect(errorOf(again)).toBe(AuthExceptionCodes.AUTH_019);
    });

    it('refuses when the NGO was registered in the meantime (ORG_004)', async () => {
      const { ticket, cookie } = await ticketFor();
      await organization({ taxId: CUI });
      const response = await register(ticket, cookie);
      expect(response.status).toBe(409);
      expect(errorOf(response)).toBe('ORG_004');
    });

    it('does not copy a logo from a host that is not allowed', async () => {
      const { ticket, cookie } = await ticketFor(
        ngohubAdmin({
          organization: fakeOrganization({
            cui: CUI,
            logo_url: 'https://evil.example/logo.png',
          }),
        }),
      );
      const response = await register(ticket, cookie, {
        useNgoHubLogo: 'true',
      });
      expect(response.status).toBe(200);
      const [{ logo }] = await testApp.dataSource.query(
        `SELECT logo FROM organization`,
      );
      expect(logo).toBeNull();
    });
  });
});
