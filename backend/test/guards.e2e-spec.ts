import { JwtService } from '@nestjs/jwt';
import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import * as request from 'supertest';
import { generateTestAuthKeys } from './utils/auth-test-config';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// Layer 4 done-when, over HTTP: Cognito tokens are refused, VIC's own tokens pass, a disabled login or a
// suspended NGO is refused on the next request, realms do not mix, old app versions get 426.
describe('JWT guards (e2e)', () => {
  let testApp: TestApp;
  let facade: AuthIdentityFacade;
  let organizationId: string;
  let admin: IAuthIdentityModel;
  let volunteer: IAuthIdentityModel;

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  beforeAll(async () => {
    testApp = await createTestApp();
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
    ]);
    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone) VALUES ('Org', 'org@example.ro', '+40700000000') RETURNING id`,
    );
    organizationId = organization.id;
    const [adminUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, cognito_id, name, email, phone, organization_id)
       VALUES ('admin', 'legacy-admin', 'Ana Admin', 'ana@example.ro', '+40711111111', $1) RETURNING id`,
      [organizationId],
    );
    admin = await facade.createIdentity({
      realm: AuthRealm.WEB,
      email: 'ana@example.ro',
      status: AuthIdentityStatus.ACTIVE,
      userId: adminUser.id,
    });
    volunteer = await facade.createIdentity({
      realm: AuthRealm.MOBILE,
      email: 'elena@example.ro',
      status: AuthIdentityStatus.ACTIVE,
    });
  });

  it('a token minted for a seeded admin opens a web route', async () => {
    const token = await testApp.mintAccessToken(admin, AuthRealm.WEB);

    const response = await http()
      .get('/organization')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.id).toBe(organizationId);
  });

  // Regression: organization.status (own auth, Layer 1) made a bare `status` in the volunteer query ambiguous (422).
  it('an admin lists the volunteers of each status', async () => {
    const token = await testApp.mintAccessToken(admin, AuthRealm.WEB);

    for (const status of ['active', 'inactive', 'blocked', 'candidate']) {
      await http()
        .get('/volunteer')
        .query({
          status,
          limit: 10,
          page: 1,
          orderBy: 'user.name',
          orderDirection: 'ASC',
        })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    }
  });

  it('a Cognito-style token is refused', async () => {
    const keys = generateTestAuthKeys();
    const cognito = new JwtService({
      privateKey: Buffer.from(keys.JWT_PRIVATE_KEY, 'base64').toString(),
    }).sign(
      { username: 'legacy-admin', sub: 'legacy-admin' },
      {
        algorithm: 'RS256',
        issuer: 'https://cognito-idp.eu-west-1.amazonaws.com/pool',
        expiresIn: 900,
      },
    );

    await http()
      .get('/organization')
      .set('Authorization', `Bearer ${cognito}`)
      .expect(401);
    await http().get('/organization').expect(401);
  });

  it('a token issued before the login was disabled is refused on its next request', async () => {
    const token = await testApp.mintAccessToken(admin, AuthRealm.WEB);
    await facade.updateIdentity(admin.id, {
      status: AuthIdentityStatus.DISABLED,
    });

    await http()
      .get('/organization')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('an admin of a suspended NGO gets 403 AUTH_004', async () => {
    const token = await testApp.mintAccessToken(admin, AuthRealm.WEB);
    await testApp.dataSource.query(
      `UPDATE organization SET status = 'suspended' WHERE id = $1`,
      [organizationId],
    );

    const response = await http()
      .get('/organization')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(response.body.code_error).toBe('AUTH_004');
  });

  it('realms do not mix', async () => {
    const webToken = await testApp.mintAccessToken(admin, AuthRealm.WEB);
    const mobileToken = await testApp.mintAccessToken(
      volunteer,
      AuthRealm.MOBILE,
    );

    await http()
      .get('/mobile/organization')
      .set('Authorization', `Bearer ${webToken}`)
      .expect(401);
    await http()
      .get('/organization')
      .set('Authorization', `Bearer ${mobileToken}`)
      .expect(401);
    await http()
      .get('/mobile/organization')
      .set('Authorization', `Bearer ${mobileToken}`)
      .expect(200);
  });

  it('an app below MOBILE_MIN_VERSION gets 426 AUTH_011; no header passes', async () => {
    const token = await testApp.mintAccessToken(volunteer, AuthRealm.MOBILE);

    const response = await http()
      .get('/mobile/organization')
      .set('Authorization', `Bearer ${token}`)
      .set('x-app-version', '1.0.19')
      .expect(426);

    expect(response.body.code_error).toBe('AUTH_011');
    await http()
      .get('/mobile/organization')
      .set('Authorization', `Bearer ${token}`)
      .set('x-app-version', '1.1.0')
      .expect(200);
  });
});

describe('Maintenance mode (e2e)', () => {
  let testApp: TestApp;

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  beforeAll(async () => {
    testApp = await createTestApp({
      authConfig: {
        MAINTENANCE_MODE: 'true',
        MAINTENANCE_ALLOWED_IPS: '203.0.113.7',
      },
    });
  });

  afterAll(async () => {
    await testApp?.close();
  });

  it('answers 503 MAINTENANCE outside the allow-list and lets health through', async () => {
    const response = await http().get('/organization').expect(503);

    expect(response.body.code_error).toBe('MAINTENANCE');
    await http().get('/public/health').expect(200);
  });

  it('lets the allow-listed client through (the hop the load balancer appended)', async () => {
    // Behind the ALB, X-Forwarded-For ends with the address the ALB saw; trust proxy 1 makes that req.ip.
    await http()
      .get('/organization')
      .set('X-Forwarded-For', '203.0.113.7')
      .expect(401);
  });

  it('does not let a client in by sending the allow-listed IP itself', async () => {
    // The client wrote the first hop; the ALB appended the real address (9.9.9.9).
    await http()
      .get('/organization')
      .set('X-Forwarded-For', '203.0.113.7, 9.9.9.9')
      .expect(503);
  });
});
