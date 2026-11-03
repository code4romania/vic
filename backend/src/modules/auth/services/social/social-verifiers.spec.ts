import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import {
  createTestAuthConfig,
  generateTestAuthKeys,
} from '../../../../../test/utils/auth-test-config';
import { AuthExceptionCodes } from '../../exceptions/exceptions';
import { AppleTokenVerifier } from './apple.verifier';
import { FacebookTokenVerifier } from './facebook.verifier';
import { GoogleTokenVerifier } from './google.verifier';

// No network: provider keys are throwaway test keys and HTTP calls are recorded responses.
const providerKeys = generateTestAuthKeys();
const privateKey = Buffer.from(
  providerKeys.JWT_PRIVATE_KEY,
  'base64',
).toString();
const publicKey = Buffer.from(providerKeys.JWT_PUBLIC_KEY, 'base64').toString();
const signer = new JwtService({ privateKey });

const authConfig = createTestAuthConfig({
  GOOGLE_CLIENT_IDS: 'ios-client,web-client',
  APPLE_BUNDLE_ID: 'org.commitglobal.vic',
  FACEBOOK_APP_ID: '123',
  FACEBOOK_APP_SECRET: 'secret',
});

const sign = (
  payload: Record<string, unknown>,
  options: { issuer: string; audience: string; expiresIn?: number },
): string =>
  signer.sign(payload, {
    algorithm: 'RS256',
    keyid: 'provider-key',
    expiresIn: options.expiresIn ?? 600,
    issuer: options.issuer,
    audience: options.audience,
  });

const rejectsWith13 = (promise: Promise<unknown>): Promise<void> =>
  expect(promise).rejects.toMatchObject({
    response: { code_error: AuthExceptionCodes.AUTH_013 },
  });

afterEach(() => {
  jest.restoreAllMocks();
});

describe('GoogleTokenVerifier', () => {
  const verifier = new GoogleTokenVerifier(authConfig);
  const google = (
    payload: Record<string, unknown>,
    audience = 'web-client',
    expiresIn = 600,
  ): string =>
    sign(payload, {
      issuer: 'https://accounts.google.com',
      audience,
      expiresIn,
    });

  beforeEach(() => {
    jest
      .spyOn(OAuth2Client.prototype, 'getFederatedSignonCertsAsync')
      .mockResolvedValue({
        certs: { 'provider-key': publicKey },
        format: 'PEM',
      } as never);
  });

  it('returns the subject and verified email for a token issued to one of our clients', async () => {
    await expect(
      verifier.verify(
        google({ sub: 'g-1', email: 'ana@gmail.com', email_verified: true }),
      ),
    ).resolves.toEqual({
      subject: 'g-1',
      email: 'ana@gmail.com',
      emailVerified: true,
    });
  });

  it('reports an unverified email as such', async () => {
    await expect(
      verifier.verify(
        google({ sub: 'g-1', email: 'ana@gmail.com', email_verified: false }),
      ),
    ).resolves.toMatchObject({ emailVerified: false });
  });

  // google-auth-library allows five minutes of clock skew, so "expired" means more than that.
  it('refuses a token for another audience, an expired token and garbage', async () => {
    await rejectsWith13(
      verifier.verify(
        google({ sub: 'g-1', email: 'a@gmail.com' }, 'someone-else'),
      ),
    );
    await rejectsWith13(
      verifier.verify(
        google({ sub: 'g-1', email: 'a@gmail.com' }, 'web-client', -600),
      ),
    );
    await rejectsWith13(verifier.verify('not-a-jwt'));
  });
});

describe('AppleTokenVerifier', () => {
  const verifier = new AppleTokenVerifier(authConfig);
  const apple = (
    payload: Record<string, unknown>,
    overrides: { issuer?: string; audience?: string; expiresIn?: number } = {},
  ): string =>
    sign(payload, {
      issuer: overrides.issuer ?? 'https://appleid.apple.com',
      audience: overrides.audience ?? 'org.commitglobal.vic',
      expiresIn: overrides.expiresIn,
    });

  beforeEach(() => {
    jest
      .spyOn(
        AppleTokenVerifier.prototype as unknown as {
          signingKey: () => Promise<string>;
        },
        'signingKey',
      )
      .mockResolvedValue(publicKey);
  });

  it('accepts email_verified as the string "true", as Apple sends it', async () => {
    await expect(
      verifier.verify(
        apple({
          sub: 'apple-1',
          email: 'x@privaterelay.appleid.com',
          email_verified: 'true',
        }),
      ),
    ).resolves.toEqual({
      subject: 'apple-1',
      email: 'x@privaterelay.appleid.com',
      emailVerified: true,
    });
  });

  it('refuses another audience, another issuer and an expired token', async () => {
    const payload = { sub: 'apple-1', email: 'x@y.com', email_verified: true };
    await rejectsWith13(
      verifier.verify(apple(payload, { audience: 'com.other.app' })),
    );
    await rejectsWith13(
      verifier.verify(apple(payload, { issuer: 'https://evil.example' })),
    );
    await rejectsWith13(verifier.verify(apple(payload, { expiresIn: -60 })));
  });

  it('refuses a token signed with another key', async () => {
    const other = new JwtService({
      privateKey: Buffer.from(
        generateTestAuthKeys().JWT_PRIVATE_KEY,
        'base64',
      ).toString(),
    }).sign(
      { sub: 'apple-1', email: 'x@y.com', email_verified: true },
      {
        algorithm: 'RS256',
        keyid: 'provider-key',
        issuer: 'https://appleid.apple.com',
        audience: 'org.commitglobal.vic',
      },
    );

    await rejectsWith13(verifier.verify(other));
  });
});

describe('FacebookTokenVerifier', () => {
  const verifier = new FacebookTokenVerifier(authConfig);
  const respond = (
    debug: Record<string, unknown>,
    me: Record<string, unknown>,
  ): jest.SpyInstance =>
    jest.spyOn(axios, 'get').mockImplementation(async (url: string) => ({
      data: url.endsWith('/debug_token') ? { data: debug } : me,
    }));

  it('returns the Facebook user for a valid token issued to our app', async () => {
    const get = respond(
      { is_valid: true, app_id: '123', user_id: 'fb-1' },
      { id: 'fb-1', email: 'ana@example.ro' },
    );

    await expect(verifier.verify('user-token')).resolves.toEqual({
      subject: 'fb-1',
      email: 'ana@example.ro',
      emailVerified: true,
    });
    expect(get).toHaveBeenCalledWith(
      'https://graph.facebook.com/debug_token',
      expect.objectContaining({
        params: { input_token: 'user-token', access_token: '123|secret' },
      }),
    );
  });

  it.each([
    [
      'an invalid token',
      { is_valid: false, app_id: '123', user_id: 'fb-1' },
      { id: 'fb-1', email: 'a@b.ro' },
    ],
    [
      'a token of another app',
      { is_valid: true, app_id: '999', user_id: 'fb-1' },
      { id: 'fb-1', email: 'a@b.ro' },
    ],
    [
      'no email shared',
      { is_valid: true, app_id: '123', user_id: 'fb-1' },
      { id: 'fb-1' },
    ],
    [
      'a /me for another user',
      { is_valid: true, app_id: '123', user_id: 'fb-1' },
      { id: 'fb-2', email: 'a@b.ro' },
    ],
  ])('refuses %s', async (_, debug, me) => {
    respond(debug, me);

    await rejectsWith13(verifier.verify('user-token'));
  });

  it('turns a network error into AUTH_013', async () => {
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('timeout'));

    await rejectsWith13(verifier.verify('user-token'));
  });
});
