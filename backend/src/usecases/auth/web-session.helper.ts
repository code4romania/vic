import { Injectable } from '@nestjs/common';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import {
  SessionClient,
  SessionService,
} from 'src/modules/auth/services/session.service';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { LinkResult } from './auth-results';

// Starts a web session after a link (set-password, confirm-email) and loads the admin for the answer.
@Injectable()
export class WebSessionHelper {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userFacade: UserFacadeService,
  ) {}

  async start(
    identity: IAuthIdentityModel,
    client: SessionClient,
  ): Promise<LinkResult> {
    // Checked before the lookup: TypeORM drops an undefined where key and would return the first admin.
    const admin = identity.userId
      ? await this.userFacade.findAdminUser({ id: identity.userId })
      : null;
    if (!admin) throw new AuthException(AuthExceptionCodes.AUTH_005);

    const tokens = await this.sessionService.createSession(
      identity,
      AuthRealm.WEB,
      client,
    );
    return {
      realm: AuthRealm.WEB,
      tokens,
      admin: { ...admin, superAdmin: identity.superAdmin },
    };
  }
}
