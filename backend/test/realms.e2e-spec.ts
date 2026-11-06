import { JwtService } from '@nestjs/jwt';
import {
  JWT_AUDIENCE,
  JWT_ISSUER,
} from 'src/infrastructure/config/auth.config';
import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { PasswordService } from 'src/modules/auth/services/password.service';
import { SessionService } from 'src/modules/auth/services/session.service';
import { api, asMobile, asWeb } from './utils/http';
import { generateTestAuthKeys } from './utils/auth-test-config';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';

// Web and mobile are two separate realms: separate audiences, separate logins for the same email.
// Whatever a token says, only VIC's own key, a live session and the right kind of user open a route.
describe('Realms (e2e)', () => {
  let testApp: TestApp;
  let http: ReturnType<typeof api>;
  let facade: AuthIdentityFacade;
  let sessions: SessionService;
  let admin: IAuthIdentityModel;
  let volunteer: IAuthIdentityModel;
  let volunteerUserId: string;
  const EMAIL = 'dana@example.ro';
  const WEB_PASSWORD = 'Web#Password1';
  const MOBILE_PASSWORD = 'Mobile#Password2';

  const sign = (
    privateKeyBase64: string,
    payload: Record<string, unknown>,
    options: { audience: string; expiresIn: number },
  ): string =>
    new JwtService({
      privateKey: Buffer.from(privateKeyBase64, 'base64').toString(),
    }).sign(payload, {
      algorithm: 'RS256',
      keyid: process.env.JWT_KEY_ID,
      issuer: JWT_ISSUER,
      ...options,
    });

  // The session id a real token carries.
  const newSessionId = async (
    identity: IAuthIdentityModel,
    realm: AuthRealm,
  ): Promise<string> => {
    const { accessToken } = await sessions.createSession(identity, realm);
    return JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64url').toString(),
    ).sid;
  };

  beforeAll(async () => {
    testApp = await createTestApp();
    http = api(testApp.app);
    facade = testApp.app.get(AuthIdentityFacade);
    sessions = testApp.app.get(SessionService);
  });

  afterAll(async () => {
    await testApp?.close();
  });

  // The same person as an NGO admin and as a volunteer, with a different password in each realm.
  beforeEach(async () => {
    await testApp.flushRedis();
    await truncate(testApp.dataSource, [
      'auth_identity',
      'user',
      'organization',
    ]);
    const passwords = testApp.app.get(PasswordService);
    const [organization] = await testApp.dataSource.query(
      `INSERT INTO organization (name, email, phone, status, validated_at)
       VALUES ('Org', 'org@example.ro', '+40700000000', 'active', now()) RETURNING id`,
    );
    const [adminUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, organization_id)
       VALUES ('admin', 'Dana Admin', $1, '+40711111111', $2) RETURNING id`,
      [EMAIL, organization.id],
    );
    const [volunteerUser] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone, first_name, last_name)
       VALUES ('regular', 'Dana Vol', $1, '+40722222222', 'Dana', 'Vol') RETURNING id`,
      [EMAIL],
    );
    volunteerUserId = volunteerUser.id;
    admin = await facade.createIdentity({
      realm: AuthRealm.WEB,
      email: EMAIL,
      status: AuthIdentityStatus.ACTIVE,
      passwordHash: await passwords.hash(WEB_PASSWORD),
      passwordSetAt: new Date(),
      emailVerifiedAt: new Date(),
      userId: adminUser.id,
    });
    volunteer = await facade.createIdentity({
      realm: AuthRealm.MOBILE,
      email: EMAIL,
      status: AuthIdentityStatus.ACTIVE,
      passwordHash: await passwords.hash(MOBILE_PASSWORD),
      passwordSetAt: new Date(),
      emailVerifiedAt: new Date(),
      userId: volunteerUser.id,
    });
  });

  it('one email in both realms has two independent passwords', async () => {
    await asWeb(http, EMAIL, WEB_PASSWORD);
    await asMobile(http, EMAIL, MOBILE_PASSWORD);

    expect(
      (
        await http
          .post('/auth/web/login')
          .send({ email: EMAIL, password: MOBILE_PASSWORD })
          .expect(401)
      ).body.code_error,
    ).toBe('AUTH_001');
    expect(
      (
        await http
          .post('/mobile/auth/login')
          .send({ email: EMAIL, password: WEB_PASSWORD })
          .expect(401)
      ).body.code_error,
    ).toBe('AUTH_001');

    // Changing the app password leaves the web password as it was.
    const mobile = await asMobile(http, EMAIL, MOBILE_PASSWORD);
    await http
      .patch('/mobile/auth/change-password')
      .set(mobile.auth)
      .send({
        currentPassword: MOBILE_PASSWORD,
        newPassword: 'Mobile#Changed3',
      })
      .expect(204);
    await asWeb(http, EMAIL, WEB_PASSWORD);
  });

  it('a mobile token on a web route and a web token on a mobile route are 401', async () => {
    const web = await asWeb(http, EMAIL, WEB_PASSWORD);
    const mobile = await asMobile(http, EMAIL, MOBILE_PASSWORD);

    await http.get('/volunteer').set(mobile.auth).expect(401);
    await http.get('/mobile/user/profile').set(web.auth).expect(401);
    await http.get('/mobile/user/profile').set(mobile.auth).expect(200);
    await http.get('/auth/web/me').set(web.auth).expect(200);
  });

  it('a token signed with another key is 401, even with the right claims', async () => {
    const sid = await newSessionId(admin, AuthRealm.WEB);
    const forged = sign(
      generateTestAuthKeys().JWT_PRIVATE_KEY,
      { sub: admin.id, sid },
      { audience: JWT_AUDIENCE[AuthRealm.WEB], expiresIn: 900 },
    );

    await http
      .get('/auth/web/me')
      .set('Authorization', `Bearer ${forged}`)
      .expect(401);
  });

  it('an expired token is 401', async () => {
    const sid = await newSessionId(admin, AuthRealm.WEB);
    const expired = sign(
      process.env.JWT_PRIVATE_KEY,
      { sub: admin.id, sid, iat: Math.floor(Date.now() / 1000) - 1000 },
      { audience: JWT_AUDIENCE[AuthRealm.WEB], expiresIn: -10 },
    );

    await http
      .get('/auth/web/me')
      .set('Authorization', `Bearer ${expired}`)
      .expect(401);
  });

  it('a web audience on a login whose user is a volunteer is 401', async () => {
    // A web-realm token for the mobile identity: right key, live session, wrong kind of user.
    const sid = await newSessionId(volunteer, AuthRealm.MOBILE);
    const token = sessions.signAccessToken(volunteer, AuthRealm.WEB, sid);

    await http
      .get('/organization')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    await http
      .get('/auth/web/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    expect(volunteer.userId).toBe(volunteerUserId);
  });
});
