import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AUTH_EMAILS, AuthEmail } from 'src/modules/auth/constants/auth-emails';
import { AUTH_TOKEN_TTL_MS } from 'src/modules/auth/auth.constants';
import {
  AuthIdentityStatus,
  AuthRealm,
  AuthTokenForm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { IAuthTokenModel } from 'src/modules/auth/models/auth-token.model';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { AuthRateLimitService } from 'src/modules/auth/services/auth-rate-limit.service';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { swallowRateLimit } from './auth-usecase.helpers';
import { AdminContextHelper } from './token-purpose.helper';

// "Send me a new link" on an expired or used link page: a fresh link of the same type to the same login.
// Always silent: an unknown link, a disabled login, a link with nothing left to do or a rate limit all
// answer the same.
@Injectable()
export class ResendTokenUseCase implements IUseCaseService<void> {
  constructor(
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly rateLimit: AuthRateLimitService,
    private readonly authMailer: AuthMailerService,
    private readonly adminContext: AdminContextHelper,
  ) {}

  async execute(secret: string): Promise<void> {
    const old = await this.oneTimeTokenService.findAnyByLink(secret);
    const identity = old?.identity;
    if (!identity || this.nothingToDo(old, identity)) return;

    await swallowRateLimit(async () => {
      await this.rateLimit.assertCanIssue(identity.id, old.type);

      const transition = old.type === AuthTokenType.INVITE && !old.sentById;
      const { secret: fresh } = await this.oneTimeTokenService.issue({
        identity,
        type: old.type,
        form: AuthTokenForm.LINK,
        sentById: old.sentById,
        ttlMs: transition ? AUTH_TOKEN_TTL_MS.TRANSITION_LINK : undefined,
      });

      await this.authMailer.send(
        identity.email,
        await this.email(old, identity, fresh),
      );
    });
  }

  private nothingToDo(
    token: IAuthTokenModel,
    identity: IAuthIdentityModel,
  ): boolean {
    if (identity.status === AuthIdentityStatus.DISABLED) return true;
    if (token.type === AuthTokenType.VERIFY_EMAIL)
      return !!identity.emailVerifiedAt;
    // An invite is done once the person has a password; Forgot password covers the rest.
    if (token.type === AuthTokenType.INVITE) return !!identity.passwordHash;
    return false;
  }

  private async email(
    old: IAuthTokenModel,
    identity: IAuthIdentityModel,
    secret: string,
  ): Promise<AuthEmail> {
    const setPassword = this.authMailer.setPasswordUrl(secret);
    switch (old.type) {
      case AuthTokenType.INVITE:
        if (!old.sentById) {
          return identity.realm === AuthRealm.WEB
            ? AUTH_EMAILS.transitionLinkAdmin(setPassword)
            : AUTH_EMAILS.transitionLinkVolunteer(setPassword);
        }
        return AUTH_EMAILS.inviteLink(
          setPassword,
          (await this.adminContext.organizationName(identity)) ?? 'VIC',
          (await this.adminContext.adminName(old.sentById)) ?? 'VIC',
        );
      case AuthTokenType.RESET_PASSWORD:
        return AUTH_EMAILS.resetLink(setPassword);
      case AuthTokenType.VERIFY_EMAIL: {
        const confirm = this.authMailer.confirmEmailUrl(secret);
        return identity.realm === AuthRealm.WEB
          ? AUTH_EMAILS.confirmOrganizationLink(
              confirm,
              (await this.adminContext.organizationName(identity)) ?? 'VIC',
            )
          : AUTH_EMAILS.verifyEmailLink(confirm);
      }
    }
  }
}
