import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { AuthException, AuthExceptionCodes } from '../../exceptions/exceptions';
import { SocialIdentity, SocialTokenVerifier } from './social-identity';

const GRAPH = 'https://graph.facebook.com';

// Facebook access token from LoginManager: /debug_token with the app token proves it was issued to VIC's
// app and is valid; /me gives the email. Facebook only returns confirmed emails; no email → AUTH_013.
@Injectable()
export class FacebookTokenVerifier implements SocialTokenVerifier {
  constructor(private readonly authConfig: AuthConfigService) {}

  async verify(token: string): Promise<SocialIdentity> {
    try {
      const appToken = `${this.authConfig.facebookAppId}|${this.authConfig.facebookAppSecret}`;
      const debug = await axios.get(`${GRAPH}/debug_token`, {
        params: { input_token: token, access_token: appToken },
        timeout: 5000,
      });
      const data = debug.data?.data;
      if (
        !data?.is_valid ||
        String(data.app_id) !== String(this.authConfig.facebookAppId)
      ) {
        throw new Error('not a valid token for this app');
      }

      const me = await axios.get(`${GRAPH}/me`, {
        params: { fields: 'id,email', access_token: token },
        timeout: 5000,
      });
      if (!me.data?.email || String(me.data.id) !== String(data.user_id)) {
        throw new Error('no email');
      }

      return {
        subject: String(me.data.id),
        email: me.data.email,
        emailVerified: true,
      };
    } catch {
      throw new AuthException(AuthExceptionCodes.AUTH_013);
    }
  }
}
