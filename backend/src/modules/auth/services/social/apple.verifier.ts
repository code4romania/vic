import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwksClient } from 'jwks-rsa';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { AuthException, AuthExceptionCodes } from '../../exceptions/exceptions';
import { SocialIdentity, SocialTokenVerifier } from './social-identity';

const APPLE_ISSUER = 'https://appleid.apple.com';

// Apple identity token from AppleAuthentication.signInAsync: signature against Apple's JWKS, issuer,
// audience = the app's bundle id, expiry. Apple puts the email in every token for the same team.
@Injectable()
export class AppleTokenVerifier implements SocialTokenVerifier {
  private readonly jwks = new JwksClient({
    jwksUri: `${APPLE_ISSUER}/auth/keys`,
    cache: true,
    rateLimit: true,
  });
  private readonly jwt = new JwtService();

  constructor(private readonly authConfig: AuthConfigService) {}

  async verify(token: string): Promise<SocialIdentity> {
    try {
      const header = JSON.parse(
        Buffer.from(String(token).split('.')[0], 'base64url').toString(),
      );
      const publicKey = await this.signingKey(header.kid);
      const payload = await this.jwt.verifyAsync(token, {
        publicKey,
        algorithms: ['RS256'],
        issuer: APPLE_ISSUER,
        audience: this.authConfig.appleBundleId,
      });
      if (!payload?.sub) throw new Error('no subject');

      return {
        subject: payload.sub,
        email: payload.email,
        // Apple sends a boolean or the string "true".
        emailVerified: String(payload.email_verified) === 'true',
      };
    } catch {
      throw new AuthException(AuthExceptionCodes.AUTH_013);
    }
  }

  protected async signingKey(kid: string): Promise<string> {
    return (await this.jwks.getSigningKey(kid)).getPublicKey();
  }
}
