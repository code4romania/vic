import { Injectable } from '@nestjs/common';
import { TokenPurpose } from 'src/api/auth/presenters/token-info.presenter';
import { AuthTokenType } from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { IAuthTokenModel } from 'src/modules/auth/models/auth-token.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';

// A transition link is an invite nobody sent: the cutover script made it (decisions R16).
export function tokenPurpose(
  token: Pick<IAuthTokenModel, 'type' | 'sentById'>,
): TokenPurpose {
  switch (token.type) {
    case AuthTokenType.INVITE:
      return token.sentById ? TokenPurpose.INVITE : TokenPurpose.TRANSITION;
    case AuthTokenType.RESET_PASSWORD:
      return TokenPurpose.RESET;
    case AuthTokenType.VERIFY_EMAIL:
      return TokenPurpose.VERIFY_EMAIL;
  }
}

// Names a web login's organization and the admin who sent an invite, for the pages and emails.
@Injectable()
export class AdminContextHelper {
  constructor(
    private readonly userFacade: UserFacadeService,
    private readonly organizationFacade: OrganizationFacadeService,
  ) {}

  async organizationName(
    identity: Pick<IAuthIdentityModel, 'userId'>,
  ): Promise<string> {
    // Checked before each lookup: TypeORM drops an undefined where key and would return the first row.
    if (!identity.userId) return undefined;
    const admin = await this.userFacade.findAdminUser({ id: identity.userId });
    if (!admin?.organizationId) return undefined;
    const organization = await this.organizationFacade.findOrganization({
      id: admin.organizationId,
    });
    return organization?.name;
  }

  async adminName(userId: string): Promise<string> {
    if (!userId) return undefined;
    return (await this.userFacade.findAdminUser({ id: userId }))?.name;
  }
}
