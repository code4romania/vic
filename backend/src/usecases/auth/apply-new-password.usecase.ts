import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import { AuthIdentityStatus } from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { IAuthTokenModel } from 'src/modules/auth/models/auth-token.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { PasswordService } from 'src/modules/auth/services/password.service';
import { SessionService } from 'src/modules/auth/services/session.service';
import { DataSource } from 'typeorm';

// The part set-password and reset-with-code share. In one transaction: store the hash, make the login
// active, confirm the email if it was not, use the token (which ends every other set-password link) and
// end every session. Then the passwordChanged email.
@Injectable()
export class ApplyNewPasswordUseCase
  implements IUseCaseService<IAuthIdentityModel>
{
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly passwordService: PasswordService,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly sessionService: SessionService,
    private readonly authMailer: AuthMailerService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    identity: IAuthIdentityModel,
    token: IAuthTokenModel,
    password: string,
  ): Promise<IAuthIdentityModel> {
    // A live link must not bring back a login an admin disabled.
    if (identity.status === AuthIdentityStatus.DISABLED) {
      throw new AuthException(AuthExceptionCodes.AUTH_004);
    }
    if (!this.passwordService.meetsPolicy(password)) {
      throw new AuthException(AuthExceptionCodes.AUTH_007);
    }

    // Hashing takes ~100 ms; done before the transaction opens.
    const passwordHash = await this.passwordService.hash(password);
    const now = new Date();

    const updated = await this.dataSource.transaction(async (manager) => {
      await this.oneTimeTokenService.consume(token, manager);
      const result = await this.authIdentityFacade.updateIdentity(
        identity.id,
        {
          passwordHash,
          status: AuthIdentityStatus.ACTIVE,
          passwordSetAt: now,
          emailVerifiedAt: identity.emailVerifiedAt ?? now,
          failedAttempts: 0,
          lockedUntil: null,
        },
        manager,
      );
      await this.sessionService.revokeAll(identity.id, undefined, manager);
      return result;
    });

    await this.authMailer.send(updated.email, AUTH_EMAILS.passwordChanged());

    return updated;
  }
}
