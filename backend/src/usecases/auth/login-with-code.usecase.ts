import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  AuthIdentityStatus,
  AuthRealm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
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
import { CompleteLoginHelper } from './complete-login.helper';

// The app: email + the 6-digit code from the email. A wrong code counts an attempt (AUTH_005); the fifth
// ends the code (AUTH_006). A volunteer without a profile yet gets 404 USER_001 on /mobile/user/profile
// afterwards, which is the app's signal to open the profile form.
@Injectable()
export class LoginWithCodeUseCase implements IUseCaseService<SessionTokens> {
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly completeLogin: CompleteLoginHelper,
    private readonly sessionService: SessionService,
  ) {}

  async execute(
    email: string,
    code: string,
    client: SessionClient = {},
  ): Promise<SessionTokens> {
    const identity = await this.authIdentityFacade.findIdentity({
      realm: AuthRealm.MOBILE,
      email,
    });
    if (!identity) throw new AuthException(AuthExceptionCodes.AUTH_005);
    if (identity.status === AuthIdentityStatus.DISABLED) {
      throw new AuthException(AuthExceptionCodes.AUTH_004);
    }

    const token = await this.oneTimeTokenService.verifyCode(
      identity,
      AuthTokenType.LOGIN,
      code,
    );
    const updated = await this.completeLogin.consume(identity, token);

    return this.sessionService.createSession(updated, AuthRealm.MOBILE, client);
  }
}
