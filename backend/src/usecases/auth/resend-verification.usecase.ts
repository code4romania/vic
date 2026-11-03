import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import {
  AuthIdentityStatus,
  AuthRealm,
  AuthTokenForm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { AuthRateLimitService } from 'src/modules/auth/services/auth-rate-limit.service';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { swallowRateLimit } from './auth-usecase.helpers';
import { AdminContextHelper } from './token-purpose.helper';

// "Resend the confirmation" after AUTH_003, by email (decisions R14, R15). Web: the NGO confirmation;
// mobile: the sign-up link. Always silent, whatever the email.
@Injectable()
export class ResendVerificationUseCase implements IUseCaseService<void> {
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly rateLimit: AuthRateLimitService,
    private readonly authMailer: AuthMailerService,
    private readonly adminContext: AdminContextHelper,
  ) {}

  async execute(realm: AuthRealm, email: string): Promise<void> {
    const identity = await this.authIdentityFacade.findIdentity({
      realm,
      email,
    });
    if (
      !identity ||
      identity.emailVerifiedAt ||
      identity.status === AuthIdentityStatus.DISABLED
    ) {
      return;
    }

    await swallowRateLimit(async () => {
      await this.rateLimit.assertCanIssue(
        identity.id,
        AuthTokenType.VERIFY_EMAIL,
      );
      const { secret } = await this.oneTimeTokenService.issue({
        identity,
        type: AuthTokenType.VERIFY_EMAIL,
        form: AuthTokenForm.LINK,
      });
      const url = this.authMailer.confirmEmailUrl(secret);

      await this.authMailer.send(
        identity.email,
        realm === AuthRealm.WEB
          ? AUTH_EMAILS.confirmOrganizationLink(
              url,
              (await this.adminContext.organizationName(identity)) ?? 'VIC',
            )
          : AUTH_EMAILS.verifyEmailLink(url),
      );
    });
  }
}
