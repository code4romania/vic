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
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { SessionClient } from 'src/modules/auth/services/session.service';
import { LinkResult } from './auth-results';
import { CompleteLoginHelper } from './complete-login.helper';
import { WebSessionHelper } from './web-session.helper';

// The web magic link page: a login link, a Team invite, or the cutover's "VIC has a new login" link
// (an invite nobody sent). Each one logs the admin in; there is no password to choose.
@Injectable()
export class LoginWithLinkUseCase implements IUseCaseService<LinkResult> {
  constructor(
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly completeLogin: CompleteLoginHelper,
    private readonly webSession: WebSessionHelper,
  ) {}

  async execute(
    secret: string,
    client: SessionClient = {},
  ): Promise<LinkResult> {
    const token = await this.oneTimeTokenService.peekLink(secret);
    const identity = token?.identity;
    if (
      !identity ||
      identity.realm !== AuthRealm.WEB ||
      ![AuthTokenType.LOGIN, AuthTokenType.INVITE].includes(token.type)
    ) {
      throw new AuthException(AuthExceptionCodes.AUTH_005);
    }
    if (identity.status === AuthIdentityStatus.DISABLED) {
      throw new AuthException(AuthExceptionCodes.AUTH_004);
    }

    const updated = await this.completeLogin.consume(identity, token);
    return this.webSession.start(updated, client);
  }
}
