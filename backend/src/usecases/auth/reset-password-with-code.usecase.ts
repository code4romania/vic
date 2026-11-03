import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AuthRealm, AuthTokenType } from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import {
  SessionClient,
  SessionService,
  SessionTokens,
} from 'src/modules/auth/services/session.service';
import { ApplyNewPasswordUseCase } from './apply-new-password.usecase';

// Forgot password started in the app: the 6-digit code and the new password; logs the volunteer in.
@Injectable()
export class ResetPasswordWithCodeUseCase
  implements IUseCaseService<SessionTokens>
{
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly applyNewPassword: ApplyNewPasswordUseCase,
    private readonly sessionService: SessionService,
  ) {}

  async execute(
    email: string,
    code: string,
    password: string,
    client: SessionClient = {},
  ): Promise<SessionTokens> {
    const identity = await this.authIdentityFacade.findIdentity({
      realm: AuthRealm.MOBILE,
      email,
    });
    if (!identity) throw new AuthException(AuthExceptionCodes.AUTH_005);

    const token = await this.oneTimeTokenService.verifyCode(
      identity,
      AuthTokenType.RESET_PASSWORD,
      code,
    );
    const updated = await this.applyNewPassword.execute(
      identity,
      token,
      password,
    );

    return this.sessionService.createSession(updated, AuthRealm.MOBILE, client);
  }
}
