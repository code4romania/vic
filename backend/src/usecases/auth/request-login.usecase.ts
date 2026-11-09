import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import {
  AuthIdentityStatus,
  AuthRealm,
  AuthTokenForm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { AuthRateLimitService } from 'src/modules/auth/services/auth-rate-limit.service';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { swallowRateLimit } from './auth-usecase.helpers';
import { ResendVerificationUseCase } from './resend-verification.usecase';

export interface RequestLoginResult {
  maskedEmail: string;
}

// VIC 2.0 (#514): login without passwords.
// Web (NGO admins): a magic link, valid 15 minutes. Only existing admin logins get one; any other email
// gets the same answer, so the page cannot be used to find out who has an account.
// Mobile (volunteers): a 6-digit code, valid 15 minutes. An unknown email gets a login here: signing up
// and logging in are the same step, and the profile is filled in after the first login.
@Injectable()
export class RequestLoginUseCase
  implements IUseCaseService<RequestLoginResult>
{
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly rateLimit: AuthRateLimitService,
    private readonly authMailer: AuthMailerService,
    private readonly resendVerification: ResendVerificationUseCase,
  ) {}

  async execute(realm: AuthRealm, email: string): Promise<RequestLoginResult> {
    const maskedEmail = this.oneTimeTokenService.maskEmail(email);
    return realm === AuthRealm.WEB
      ? this.requestWeb(email, maskedEmail)
      : this.requestMobile(email, maskedEmail);
  }

  private async requestWeb(
    email: string,
    maskedEmail: string,
  ): Promise<RequestLoginResult> {
    const identity = await this.authIdentityFacade.findIdentity({
      realm: AuthRealm.WEB,
      email,
    });

    // A volunteer on the web login is sent to the app (decisions R19).
    if (!identity) {
      const volunteer = await this.authIdentityFacade.findIdentity({
        realm: AuthRealm.MOBILE,
        email,
      });
      if (volunteer) throw new AuthException(AuthExceptionCodes.AUTH_012);
      return { maskedEmail };
    }
    if (identity.status === AuthIdentityStatus.DISABLED) return { maskedEmail };

    // A newly registered NGO whose admin never confirmed the email: the confirmation link again, since
    // it is the one that activates the organization (and logs in).
    if (!identity.emailVerifiedAt) {
      await this.resendVerification.execute(AuthRealm.WEB, email);
      return { maskedEmail };
    }

    await swallowRateLimit(async () => {
      await this.rateLimit.assertCanIssue(identity.id, AuthTokenType.LOGIN);
      const { secret } = await this.oneTimeTokenService.issue({
        identity,
        type: AuthTokenType.LOGIN,
        form: AuthTokenForm.LINK,
      });
      await this.authMailer.send(
        identity.email,
        AUTH_EMAILS.loginLink(this.authMailer.loginLinkUrl(secret)),
      );
    });

    return { maskedEmail };
  }

  private async requestMobile(
    email: string,
    maskedEmail: string,
  ): Promise<RequestLoginResult> {
    let identity = await this.authIdentityFacade.findIdentity({
      realm: AuthRealm.MOBILE,
      email,
    });
    if (identity?.status === AuthIdentityStatus.DISABLED) {
      throw new AuthException(AuthExceptionCodes.AUTH_004);
    }
    if (!identity) {
      identity = await this.authIdentityFacade.createIdentity({
        realm: AuthRealm.MOBILE,
        email,
        status: AuthIdentityStatus.PENDING,
      });
    }

    // Shown in the app ("wait a minute"): the sign-up is open, so it tells nobody anything new.
    await this.rateLimit.assertCanIssue(identity.id, AuthTokenType.LOGIN);
    const { secret } = await this.oneTimeTokenService.issue({
      identity,
      type: AuthTokenType.LOGIN,
      form: AuthTokenForm.CODE,
    });
    await this.authMailer.send(identity.email, AUTH_EMAILS.loginCode(secret));

    return { maskedEmail };
  }
}
