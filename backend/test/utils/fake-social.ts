import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import {
  SocialIdentity,
  SocialTokenVerifier,
} from 'src/modules/auth/services/social/social-identity';

// The e2e suite never calls Google, Apple or Facebook. A fixture token is the claims a provider would sign,
// base64url-encoded; the fake checks the same things the real verifiers do (audience, expiry, a subject)
// and answers AUTH_013 otherwise. The real signature checks are covered by social-verifiers.spec.ts.
export const SOCIAL_TEST_AUDIENCE = 'vic-e2e';

export interface SocialFixture {
  sub: string;
  email?: string;
  email_verified?: boolean;
  aud?: string;
  exp?: number; // seconds since epoch
}

export function socialToken(fixture: SocialFixture): string {
  const claims = {
    aud: SOCIAL_TEST_AUDIENCE,
    exp: Math.floor(Date.now() / 1000) + 3600,
    email_verified: true,
    ...fixture,
  };
  return `fixture.${Buffer.from(JSON.stringify(claims)).toString('base64url')}`;
}

export class FakeSocialVerifier implements SocialTokenVerifier {
  async verify(token: string): Promise<SocialIdentity> {
    try {
      const [kind, body] = String(token).split('.');
      if (kind !== 'fixture') throw new Error('not a fixture');
      const claims: SocialFixture = JSON.parse(
        Buffer.from(body, 'base64url').toString(),
      );
      if (claims.aud !== SOCIAL_TEST_AUDIENCE) throw new Error('audience');
      if (!claims.exp || claims.exp * 1000 < Date.now())
        throw new Error('expired');
      if (!claims.sub) throw new Error('no subject');
      return {
        subject: claims.sub,
        email: claims.email,
        emailVerified: claims.email_verified === true,
      };
    } catch {
      throw new AuthException(AuthExceptionCodes.AUTH_013);
    }
  }
}
