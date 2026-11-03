import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { AuthException, AuthExceptionCodes } from '../../exceptions/exceptions';
import { SocialIdentity, SocialTokenVerifier } from './social-identity';

// Google ID token from GoogleSignin.signIn(): signature against Google's certificates, audience one of
// GOOGLE_CLIENT_IDS (iOS, Android and the web client used as audience), expiry, email_verified.
@Injectable()
export class GoogleTokenVerifier implements SocialTokenVerifier {
  private readonly client = new OAuth2Client();

  constructor(private readonly authConfig: AuthConfigService) {}

  async verify(token: string): Promise<SocialIdentity> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.authConfig.googleClientIds,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub) throw new Error('no subject');

      return {
        subject: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified === true,
      };
    } catch {
      throw new AuthException(AuthExceptionCodes.AUTH_013);
    }
  }
}
