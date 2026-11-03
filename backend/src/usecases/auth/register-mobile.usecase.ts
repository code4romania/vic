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
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { PasswordService } from 'src/modules/auth/services/password.service';
import { DataSource } from 'typeorm';

export interface RegisterResult {
  maskedEmail: string;
  phone: string;
}

// Mobile sign-up: an active login with an unconfirmed email and a 24 h confirmation link. AUTH_009 for an
// email already registered is the one accepted enumeration, as with Cognito today.
@Injectable()
export class RegisterMobileUseCase implements IUseCaseService<RegisterResult> {
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly passwordService: PasswordService,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly authMailer: AuthMailerService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    email: string,
    password: string,
    phone: string,
  ): Promise<RegisterResult> {
    const existing = await this.authIdentityFacade.findIdentity({
      realm: AuthRealm.MOBILE,
      email,
    });
    if (existing) throw new AuthException(AuthExceptionCodes.AUTH_009);
    if (!this.passwordService.meetsPolicy(password)) {
      throw new AuthException(AuthExceptionCodes.AUTH_007);
    }

    const passwordHash = await this.passwordService.hash(password);

    const { identity, secret } = await this.dataSource.transaction(
      async (manager) => {
        const created = await this.authIdentityFacade.createIdentity(
          {
            realm: AuthRealm.MOBILE,
            email,
            passwordHash,
            status: AuthIdentityStatus.ACTIVE,
            passwordSetAt: new Date(),
          },
          manager,
        );
        const issued = await this.oneTimeTokenService.issue(
          {
            identity: created,
            type: AuthTokenType.VERIFY_EMAIL,
            form: AuthTokenForm.LINK,
          },
          manager,
        );
        return { identity: created, secret: issued.secret };
      },
    );

    await this.authMailer.send(
      identity.email,
      AUTH_EMAILS.verifyEmailLink(this.authMailer.confirmEmailUrl(secret)),
    );

    return {
      maskedEmail: this.oneTimeTokenService.maskEmail(identity.email),
      phone,
    };
  }
}
