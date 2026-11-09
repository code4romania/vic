import { Injectable } from '@nestjs/common';
import { ITokenInfo } from 'src/api/auth/presenters/token-info.presenter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AuthRealm, AuthTokenType } from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { AdminContextHelper, tokenPurpose } from './token-purpose.helper';

// What the login-link and confirm-email pages need before the user types anything. AUTH_005 unless live.
@Injectable()
export class GetTokenInfoUseCase implements IUseCaseService<ITokenInfo> {
  constructor(
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly adminContext: AdminContextHelper,
  ) {}

  async execute(secret: string): Promise<ITokenInfo> {
    const token = await this.oneTimeTokenService.peekLink(secret);
    if (!token?.identity) throw new AuthException(AuthExceptionCodes.AUTH_005);

    const { identity } = token;
    const organizationName =
      token.type === AuthTokenType.INVITE && identity.realm === AuthRealm.WEB
        ? await this.adminContext.organizationName(identity)
        : undefined;

    return {
      type: token.type,
      purpose: tokenPurpose(token),
      realm: identity.realm,
      maskedEmail: this.oneTimeTokenService.maskEmail(identity.email),
      organizationName,
    };
  }
}
