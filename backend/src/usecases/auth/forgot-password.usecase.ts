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

// A link on the web, a 6-digit code in the app. Answers the same whether or not the login exists.
// A reset link never ends the transition link; using either ends the other (OneTimeTokenService.consume).
@Injectable()
export class ForgotPasswordUseCase implements IUseCaseService<void> {
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly rateLimit: AuthRateLimitService,
    private readonly authMailer: AuthMailerService,
  ) {}

  async execute(realm: AuthRealm, email: string): Promise<void> {
    const identity = await this.authIdentityFacade.findIdentity({
      realm,
      email,
    });
    if (!identity || identity.status === AuthIdentityStatus.DISABLED) return;

    await swallowRateLimit(async () => {
      await this.rateLimit.assertCanIssue(
        identity.id,
        AuthTokenType.RESET_PASSWORD,
      );

      const form =
        realm === AuthRealm.WEB ? AuthTokenForm.LINK : AuthTokenForm.CODE;
      const { secret } = await this.oneTimeTokenService.issue({
        identity,
        type: AuthTokenType.RESET_PASSWORD,
        form,
      });

      await this.authMailer.send(
        identity.email,
        form === AuthTokenForm.LINK
          ? AUTH_EMAILS.resetLink(this.authMailer.setPasswordUrl(secret))
          : AUTH_EMAILS.resetCode(secret),
      );
    });
  }
}
