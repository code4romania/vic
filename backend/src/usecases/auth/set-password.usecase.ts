import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AuthRealm, AuthTokenType } from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { SessionClient } from 'src/modules/auth/services/session.service';
import { ApplyNewPasswordUseCase } from './apply-new-password.usecase';
import { LinkResult } from './auth-results';
import { WebSessionHelper } from './web-session.helper';

// Transition, reset and invite links, both realms.
@Injectable()
export class SetPasswordUseCase implements IUseCaseService<LinkResult> {
  constructor(
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly applyNewPassword: ApplyNewPasswordUseCase,
    private readonly webSession: WebSessionHelper,
  ) {}

  async execute(
    secret: string,
    password: string,
    client: SessionClient = {},
  ): Promise<LinkResult> {
    const token = await this.oneTimeTokenService.peekLink(secret);
    if (
      !token?.identity ||
      ![AuthTokenType.INVITE, AuthTokenType.RESET_PASSWORD].includes(token.type)
    ) {
      throw new AuthException(AuthExceptionCodes.AUTH_005);
    }

    const identity = await this.applyNewPassword.execute(
      token.identity,
      token,
      password,
    );

    return identity.realm === AuthRealm.WEB
      ? this.webSession.start(identity, client)
      : { realm: AuthRealm.MOBILE, email: identity.email };
  }
}
