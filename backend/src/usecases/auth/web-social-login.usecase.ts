import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  AuthIdentityStatus,
  AuthProvider,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { SessionClient } from 'src/modules/auth/services/session.service';
import { SocialTokenVerifierService } from 'src/modules/auth/services/social/social-token-verifier.service';
import { WebLoginResult } from './auth-results';
import { WebSessionHelper } from './web-session.helper';
import { AppleTokenService } from 'src/modules/auth/services/social/apple-token.service';

// Google or Apple on the web login (#512). Only an existing admin login, found by the verified email:
// the web never creates a login (NGOs sign up, admins are invited) and keeps no provider link, since a
// Google or Apple account is linked at most once and the same person may also be a volunteer in the app.
@Injectable()
export class WebSocialLoginUseCase implements IUseCaseService<WebLoginResult> {
  constructor(
    private readonly verifier: SocialTokenVerifierService,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly webSession: WebSessionHelper,
    private readonly appleTokens: AppleTokenService,
  ) {}

  async execute(
    provider: AuthProvider,
    token: string,
    client: SessionClient = {},
    authorizationCode?: string,
  ): Promise<WebLoginResult> {
    const social = await this.verifier.verify(provider, token);
    if (!social.email || !social.emailVerified) {
      throw new AuthException(AuthExceptionCodes.AUTH_013);
    }

    const identity = await this.authIdentityFacade.findIdentity({
      realm: AuthRealm.WEB,
      email: social.email,
    });
    if (!identity) {
      // A volunteer on the web login is sent to the app (decisions R19).
      const volunteer = await this.authIdentityFacade.findIdentity({
        realm: AuthRealm.MOBILE,
        email: social.email,
      });
      throw new AuthException(
        volunteer ? AuthExceptionCodes.AUTH_012 : AuthExceptionCodes.AUTH_014,
      );
    }
    if (identity.status === AuthIdentityStatus.DISABLED) {
      throw new AuthException(AuthExceptionCodes.AUTH_004);
    }
    // A new NGO is confirmed only through its emailed link, which also activates the organization.
    if (!identity.emailVerifiedAt) {
      throw new AuthException(AuthExceptionCodes.AUTH_003);
    }

    // An invited admin who never used the invite: the provider has proven the email.
    const current =
      identity.status === AuthIdentityStatus.PENDING
        ? await this.authIdentityFacade.updateIdentity(identity.id, {
            status: AuthIdentityStatus.ACTIVE,
          })
        : identity;

    // App Store 5.1.1(v): revoked when the organization (and with it this login) is deleted
    if (provider === AuthProvider.APPLE && authorizationCode) {
      await this.appleTokens.storeFromAuthorizationCode(
        current.id,
        authorizationCode,
        true,
      );
    }

    return this.webSession.start(current, client);
  }
}
