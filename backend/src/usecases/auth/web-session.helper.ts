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
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { WebLoginResult } from './auth-results';

// Starts a web session after a link (magic link, invite, confirm-email) and loads the admin for the answer.
// An admin of a suspended NGO cannot log in (AUTH_004, decisions R8).
@Injectable()
export class WebSessionHelper {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userFacade: UserFacadeService,
    private readonly organizationFacade: OrganizationFacadeService,
  ) {}

  async start(
    identity: IAuthIdentityModel,
    client: SessionClient,
  ): Promise<WebLoginResult> {
    // Checked before the lookup: TypeORM drops an undefined where key and would return the first admin.
    const admin = identity.userId
      ? await this.userFacade.findAdminUser({ id: identity.userId })
      : null;
    if (!admin) throw new AuthException(AuthExceptionCodes.AUTH_005);

    const organization = admin.organizationId
      ? await this.organizationFacade.findOrganization({
          id: admin.organizationId,
        })
      : null;
    if (organization?.status === OrganizationStatus.SUSPENDED) {
      throw new AuthException(AuthExceptionCodes.AUTH_004);
    }

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
