import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import {
  AuthRealm,
  AuthTokenForm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { IWebRequestUser } from 'src/modules/auth/interfaces/request-user.interface';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { AuthRateLimitService } from 'src/modules/auth/services/auth-rate-limit.service';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { SessionService } from 'src/modules/auth/services/session.service';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import {
  SensitiveAction,
  SensitiveActionUsecase,
} from './sensitive-action.usecase';

// VIC 2.0, #508: the admin changes their login email. One code goes to the current address (the
// sensitive action check) and one to the new address (it exists and is theirs); both are needed.
@Injectable()
export class ChangeEmailUsecase {
  constructor(
    private readonly sensitiveAction: SensitiveActionUsecase,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly userFacade: UserFacadeService,
    private readonly authMailer: AuthMailerService,
    private readonly rateLimit: AuthRateLimitService,
    private readonly sessionService: SessionService,
    private readonly dataSource: DataSource,
  ) {}

  private async assertFree(
    email: string,
    admin: IWebRequestUser,
  ): Promise<void> {
    const identity = await this.authIdentityFacade.findIdentity({
      realm: AuthRealm.WEB,
      email,
    });
    const user = await this.userFacade.findAdminUser({ email });
    if (
      (identity && identity.id !== admin.identityId) ||
      (user && user.id !== admin.id)
    ) {
      throw new AuthException(AuthExceptionCodes.AUTH_009);
    }
  }

  public async requestCodes(
    admin: IWebRequestUser,
    newEmail: string,
  ): Promise<{ maskedEmail: string; newEmail: string }> {
    if (newEmail === admin.email.toLowerCase()) {
      throw new AuthException(AuthExceptionCodes.AUTH_009);
    }
    await this.assertFree(newEmail, admin);
    await this.rateLimit.assertCanIssue(
      admin.identityId,
      AuthTokenType.CHANGE_EMAIL,
    );
    const { secret } = await this.oneTimeTokenService.issue({
      identity: { id: admin.identityId, email: admin.email },
      type: AuthTokenType.CHANGE_EMAIL,
      form: AuthTokenForm.CODE,
      sentTo: newEmail,
    });
    await this.authMailer.send(newEmail, AUTH_EMAILS.changeEmailCode(secret));
    const { maskedEmail } = await this.sensitiveAction.requestCode(
      admin,
      SensitiveAction.CHANGE_EMAIL,
    );
    return { maskedEmail, newEmail };
  }

  public async confirm(
    admin: IWebRequestUser,
    code: string,
    newEmailCode: string,
  ): Promise<{ email: string }> {
    // the new address's code first: it says which address was confirmed
    const token = await this.oneTimeTokenService.verifyCode(
      { id: admin.identityId },
      AuthTokenType.CHANGE_EMAIL,
      newEmailCode,
    );
    const newEmail = token.sentTo;
    await this.sensitiveAction.verify(admin, code);
    await this.assertFree(newEmail, admin);

    await this.dataSource.transaction(async (manager) => {
      await this.oneTimeTokenService.consume(token, manager);
      await manager.query(`UPDATE "user" SET email = $1 WHERE id = $2`, [
        newEmail,
        admin.id,
      ]);
      await manager.query(`UPDATE auth_identity SET email = $1 WHERE id = $2`, [
        newEmail,
        admin.identityId,
      ]);
      // other browsers log in again; this one stays
      await this.sessionService.revokeAll(
        admin.identityId,
        admin.sessionId,
        manager,
      );
    });

    await this.authMailer.send(admin.email, AUTH_EMAILS.emailChanged(newEmail));
    return { email: newEmail };
  }
}
