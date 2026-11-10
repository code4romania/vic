import { JwtService } from '@nestjs/jwt';
import { createPublicKey } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { JwksClient } from 'jwks-rsa';
import {
  createTestAuthConfig,
  generateTestAuthKeys,
} from '../../../../../test/utils/auth-test-config';
import { AuthExceptionCodes } from '../../exceptions/exceptions';
import { AppleTokenVerifier } from './apple.verifier';
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
  APPLE_SERVICES_ID: 'org.commitglobal.vic.web',
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

  it('accepts the web Services ID as audience too (#512)', async () => {
    await expect(
      verifier.verify(
        apple(
          { sub: 'apple-1', email: 'ana@icloud.com', email_verified: true },
          { audience: 'org.commitglobal.vic.web' },
        ),
      ),
    ).resolves.toMatchObject({ subject: 'apple-1', emailVerified: true });
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

// The real key lookup, with Apple's JWKS document replaced: the key is picked by the token's kid.
describe('AppleTokenVerifier with a mocked JWKS', () => {
  const jwk = {
    ...createPublicKey(publicKey).export({ format: 'jwk' }),
    kid: 'provider-key',
    use: 'sig',
    alg: 'RS256',
  };
  const token = sign(
    { sub: 'apple-2', email: 'ion@icloud.com', email_verified: 'true' },
    { issuer: 'https://appleid.apple.com', audience: 'org.commitglobal.vic' },
  );

  it('checks the signature with the JWKS key named in the token header', async () => {
    const getKeys = jest
      .spyOn(JwksClient.prototype, 'getKeys')
      .mockResolvedValue([jwk] as never);

    await expect(
      new AppleTokenVerifier(authConfig).verify(token),
    ).resolves.toMatchObject({ subject: 'apple-2', email: 'ion@icloud.com' });
    expect(getKeys).toHaveBeenCalled();
  });

  it('turns a kid missing from the JWKS into AUTH_013', async () => {
    jest
      .spyOn(JwksClient.prototype, 'getKeys')
      .mockResolvedValue([{ ...jwk, kid: 'another-key' }] as never);

    await rejectsWith13(new AppleTokenVerifier(authConfig).verify(token));
  });
});
