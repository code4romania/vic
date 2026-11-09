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
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import {
  SessionClient,
  SessionService,
  SessionTokens,
} from 'src/modules/auth/services/session.service';
import { SocialTokenVerifierService } from 'src/modules/auth/services/social/social-token-verifier.service';
import { DataSource } from 'typeorm';

// Mobile only (decision 7). Finds the login by provider link, else by verified email, else creates one
// with the same email: the email code login keeps working for it too.
@Injectable()
export class SocialLoginUseCase implements IUseCaseService<SessionTokens> {
  constructor(
    private readonly verifier: SocialTokenVerifierService,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly sessionService: SessionService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    provider: AuthProvider,
    token: string,
    client: SessionClient = {},
  ): Promise<SessionTokens> {
    const social = await this.verifier.verify(provider, token);
    if (!social.email || !social.emailVerified) {
      throw new AuthException(AuthExceptionCodes.AUTH_013);
    }

    const link = await this.authIdentityFacade.findProviderLink(
      provider,
      social.subject,
    );
    const known: IAuthIdentityModel = link
      ? await this.authIdentityFacade.findIdentity({ id: link.identityId })
      : await this.authIdentityFacade.findIdentity({
          realm: AuthRealm.MOBILE,
          email: social.email,
        });

    if (known?.status === AuthIdentityStatus.DISABLED) {
      throw new AuthException(AuthExceptionCodes.AUTH_004);
    }

    const identity = await this.dataSource.transaction(async (manager) => {
      const now = new Date();
      let current = known;

      if (!current) {
        current = await this.authIdentityFacade.createIdentity(
          {
            realm: AuthRealm.MOBILE,
            email: social.email,
            status: AuthIdentityStatus.ACTIVE,
            emailVerifiedAt: now,
          },
          manager,
        );
      } else if (
        current.status === AuthIdentityStatus.PENDING ||
        !current.emailVerifiedAt
      ) {
        // A volunteer who never logged in (pending) becomes active; the provider has confirmed the email (decisions R4).
        current = await this.authIdentityFacade.updateIdentity(
          current.id,
          {
            status: AuthIdentityStatus.ACTIVE,
            emailVerifiedAt: current.emailVerifiedAt ?? now,
          },
          manager,
        );
      }

      if (!link) {
        await this.authIdentityFacade.linkProvider(
          {
            identityId: current.id,
            provider,
            subject: social.subject,
            emailAtLink: social.email,
          },
          manager,
        );
      }

      return current;
    });

    return this.sessionService.createSession(
      identity,
      AuthRealm.MOBILE,
      client,
    );
  }
}
