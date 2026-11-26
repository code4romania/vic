import Redis from 'ioredis';
import { AuthExceptionCodes } from 'src/modules/auth/exceptions/exceptions';
import {
  NgoHubCallbackInput,
  NgoHubOidcService,
} from 'src/modules/auth/services/ngohub/ngohub-oidc.service';
import { createTestAuthConfig } from './utils/auth-test-config';
import { api } from './utils/http';
import { createTestApp } from './utils/test-app';
import {
  FAKE_NGOHUB_CLIENT_ID,
  FAKE_NGOHUB_CLIENT_SECRET,
  FakeNgoHub,
  fakeOrganization,
} from './utils/fake-ngohub';

const REDIRECT_URI = 'https://vic.test/login/ngohub/callback';

// Login with NGO Hub, issue 02: the OIDC client against a fake NGO Hub that signs real RS256 tokens.
describe('NGO Hub OIDC client (e2e)', () => {
  let ngohub: FakeNgoHub;
  let redis: Redis;
  let service: NgoHubOidcService;

  const serviceFor = (
    overrides: Record<string, string> = {},
  ): NgoHubOidcService =>
    new NgoHubOidcService(
      createTestAuthConfig({
        NGOHUB_ISSUER: ngohub.issuer,
        NGOHUB_CLIENT_ID: FAKE_NGOHUB_CLIENT_ID,
        NGOHUB_CLIENT_SECRET: FAKE_NGOHUB_CLIENT_SECRET,
        NGOHUB_REDIRECT_URI: REDIRECT_URI,
        ...overrides,
      }),
      redis,
    );

  const login = async (): Promise<NgoHubCallbackInput> => {
    const { url, flowCookie } = await service.start();
    const params = await ngohub.authorize(url);
    return { ...params, flowCookie };
  };

  const rejected = { code: AuthExceptionCodes.AUTH_019 };

  beforeAll(async () => {
    ngohub = await new FakeNgoHub().start();
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
      keyPrefix: process.env.REDIS_KEY_PREFIX,
    });
  });

  beforeEach(() => {
    ngohub.reset();
    ngohub.redirectUris = [REDIRECT_URI];
    ngohub.loginAs = { sub: '17', email: 'admin@ngo.ro' };
    service = serviceFor();
  });

  afterAll(async () => {
    redis?.disconnect();
    await ngohub?.stop();
  });

  it('returns the NGO Hub user and organization', async () => {
    await expect(service.callback(await login())).resolves.toEqual({
      subject: '17',
      email: 'admin@ngo.ro',
      emailVerified: true,
      name: 'Admin NGO Hub',
      organization: fakeOrganization(),
    });
  });

  it('asks for code + PKCE S256 with every scope, and prompt=login only when asked', async () => {
    await service.start();
    await ngohub.authorize((await service.start({ promptLogin: true })).url);
    const [request] = ngohub.authorizeRequests;
    expect(request.get('scope')).toBe('openid email profile organization');
    expect(request.get('code_challenge_method')).toBe('S256');
    expect(request.get('prompt')).toBe('login');
    const plain = new URL((await service.start()).url).searchParams;
    expect(plain.has('prompt')).toBe(false);
  });

  it('is off without configuration', async () => {
    const off = serviceFor({ NGOHUB_CLIENT_SECRET: '' });
    expect(off.enabled).toBe(false);
    await expect(off.start()).rejects.toMatchObject({
      code: AuthExceptionCodes.AUTH_020,
    });
    expect(service.enabled).toBe(true);
  });

  it('refuses a callback without the flow cookie, or with another one', async () => {
    const params = await login();
    await expect(
      service.callback({ ...params, flowCookie: '' }),
    ).rejects.toMatchObject(rejected);
    await expect(
      service.callback({ ...(await login()), flowCookie: 'someone-else' }),
    ).rejects.toMatchObject(rejected);
  });

  it('refuses a state used twice, even after a failed attempt', async () => {
    const params = await login();
    await service.callback(params);
    await expect(service.callback(params)).rejects.toMatchObject(rejected);

    const other = await login();
    await expect(
      service.callback({ ...other, flowCookie: 'wrong' }),
    ).rejects.toMatchObject(rejected);
    await expect(service.callback(other)).rejects.toMatchObject(rejected);
  });

  it('refuses an unknown state', async () => {
    const params = await login();
    await expect(
      service.callback({ ...params, state: 'made-up' }),
    ).rejects.toMatchObject(rejected);
  });

  it.each([
    ['a wrong iss parameter', { responseIss: 'https://evil.example' }],
    ['a missing iss parameter', { responseIss: null }],
    [
      'an ID token from another issuer',
      { idToken: { iss: 'https://evil.example' } },
    ],
    ['an ID token for another client', { idToken: { aud: 'other-client' } }],
    ['an ID token with another nonce', { idToken: { nonce: 'replayed' } }],
    [
      'an expired ID token',
      { idToken: { exp: Math.floor(Date.now() / 1000) - 60 } },
    ],
    ['an ID token signed with another key', { signWithOtherKey: true }],
    ['userinfo for another subject', { userinfoSub: '18' }],
  ])('refuses %s', async (_, tamper) => {
    ngohub.tamper = tamper;
    await expect(service.callback(await login())).rejects.toMatchObject(
      rejected,
    );
  });

  it('refuses a code the provider does not accept (wrong client secret)', async () => {
    service = serviceFor({ NGOHUB_CLIENT_SECRET: 'wrong' });
    await expect(service.callback(await login())).rejects.toMatchObject(
      rejected,
    );
  });

  it('reports an unverified email and a missing organization as such', async () => {
    ngohub.loginAs = {
      sub: '17',
      email: 'admin@ngo.ro',
      email_verified: false,
      organization: null,
    };
    const profile = await service.callback(await login());
    expect(profile.emailVerified).toBe(false);
    expect(profile.organization).toBeUndefined();
  });

  it('sends the browser from /start back to the login page when the feature is off', async () => {
    const off = await createTestApp({ authConfig: {} });
    try {
      const response = await api(off.app)
        .get('/auth/web/ngohub/start')
        .expect(302);
      expect(response.headers.location).toBe(
        `https://vic.test/login?ngohub_error=${AuthExceptionCodes.AUTH_020}`,
      );
      expect(response.headers['set-cookie']).toBeUndefined();
    } finally {
      await off.close();
    }
  });
});
