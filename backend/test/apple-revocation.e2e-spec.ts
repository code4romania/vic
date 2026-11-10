import { generateKeyPairSync, createPublicKey } from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as request from 'supertest';
import { createTestApp, TestApp } from './utils/test-app';
import { truncate } from './utils/test-data-source';
import { socialToken } from './utils/fake-social';

// App Store 5.1.1(v): the app sends Apple's authorizationCode with the Apple sign-in; VIC exchanges
// it for a refresh token, keeps it encrypted and revokes it when the account is deleted. Apple is
// never called: fetch is mocked.
describe('Apple token revocation (e2e)', () => {
  const { privateKey, publicKey } = generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  let testApp: TestApp;
  let calls: { url: string; body: URLSearchParams }[];
  let fetchSpy: jest.SpyInstance;

  const http = (): request.SuperTest<request.Test> =>
    request(
      testApp.app.getHttpServer(),
    ) as unknown as request.SuperTest<request.Test>;

  const appleLogin = async (authorizationCode?: string): Promise<string> => {
    const res = await http()
      .post('/mobile/auth/social')
      .send({
        provider: 'apple',
        token: socialToken({ sub: 'apple-1', email: 'elena@example.ro' }),
        ...(authorizationCode ? { authorizationCode } : {}),
      })
      .expect(200);
    return res.body.accessToken;
  };

  const withProfile = async (): Promise<void> => {
    const [user] = await testApp.dataSource.query(
      `INSERT INTO "user" (type, name, email, phone) VALUES ('regular', 'Elena', 'elena@example.ro', '+40720000001') RETURNING id`,
    );
    await testApp.dataSource.query(
      `UPDATE auth_identity SET user_id = $1 WHERE email = 'elena@example.ro'`,
      [user.id],
    );
  };

  beforeAll(async () => {
    testApp = await createTestApp({
      authConfig: {
        APPLE_TEAM_ID: 'TEAM123',
        APPLE_KEY_ID: 'KEY123',
        APPLE_PRIVATE_KEY: Buffer.from(privateKey).toString('base64'),
      },
    });
  });

  afterAll(async () => {
    await testApp?.close();
  });

  beforeEach(async () => {
    await truncate(testApp.dataSource, ['auth_identity', 'user']);
    calls = [];
    fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async (url, init) => {
        const body = new URLSearchParams(String(init?.body));
        calls.push({ url: String(url), body });
        if (String(url).endsWith('/auth/token')) {
          return body.get('code') === 'good-code'
            ? new Response(
                JSON.stringify({
                  access_token: 'a',
                  refresh_token: 'apple-refresh-1',
                }),
                { status: 200 },
              )
            : new Response(JSON.stringify({ error: 'invalid_grant' }), {
                status: 400,
              });
        }
        return new Response('', { status: 200 });
      });
  });

  afterEach(() => fetchSpy.mockRestore());

  it('exchanges the code at sign-in, stores the token encrypted and revokes it on account deletion', async () => {
    const accessToken = await appleLogin('good-code');

    expect(calls.map((c) => c.url)).toEqual([
      'https://appleid.apple.com/auth/token',
    ]);
    const exchange = calls[0].body;
    expect(exchange.get('client_id')).toBe('org.commitglobal.vic');
    expect(exchange.get('grant_type')).toBe('authorization_code');
    const secret = jwt.verify(
      exchange.get('client_secret'),
      createPublicKey(publicKey),
      { algorithms: ['ES256'], complete: true },
    ) as jwt.Jwt;
    expect(secret.header.kid).toBe('KEY123');
    expect(secret.payload).toMatchObject({
      iss: 'TEAM123',
      sub: 'org.commitglobal.vic',
      aud: 'https://appleid.apple.com',
    });

    const [stored] = await testApp.dataSource.query(
      `SELECT apple_refresh_token FROM auth_identity`,
    );
    expect(stored.apple_refresh_token).toEqual(expect.any(String));
    expect(stored.apple_refresh_token).not.toContain('apple-refresh-1');

    await withProfile();
    calls = [];
    await http()
      .delete('/mobile/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(calls.map((c) => c.url)).toEqual([
      'https://appleid.apple.com/auth/revoke',
    ]);
    expect(calls[0].body.get('token')).toBe('apple-refresh-1');
    expect(calls[0].body.get('token_type_hint')).toBe('refresh_token');
    expect(calls[0].body.get('client_id')).toBe('org.commitglobal.vic');
  });

  it('a failed exchange or a missing code never fails the sign-in', async () => {
    await appleLogin('bad-code');
    await appleLogin();
    const [stored] = await testApp.dataSource.query(
      `SELECT apple_refresh_token FROM auth_identity`,
    );
    expect(stored.apple_refresh_token).toBeNull();
    expect(calls).toHaveLength(1);

    // nothing to revoke: the deletion does not call Apple
    const accessToken = await appleLogin();
    await withProfile();
    calls = [];
    await http()
      .delete('/mobile/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(calls).toEqual([]);
  });
});
