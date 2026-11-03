import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import {
  AuthConfigService,
  JWT_AUDIENCE,
  JWT_ISSUER,
} from 'src/infrastructure/config/auth.config';
import { Role } from 'src/common/enums/role.enum';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { AUTH_STRATEGIES } from '../auth.constants';
import { AuthIdentityStatus, AuthRealm } from '../enums/auth.enums';
import { AuthException, AuthExceptionCodes } from '../exceptions/exceptions';
import { IWebRequestUser } from '../interfaces/request-user.interface';
import { AuthIdentityFacade } from '../services/auth-identity.facade';
import { AccessTokenPayload } from '../services/session.service';

@Injectable()
export class WebJwtStrategy extends PassportStrategy(
  Strategy,
  AUTH_STRATEGIES.WEB,
) {
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly userService: UserFacadeService,
    private readonly organizationFacade: OrganizationFacadeService,
    authConfig: AuthConfigService,
  ) {
    super({
      secretOrKey: authConfig.publicKey,
      algorithms: ['RS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE[AuthRealm.WEB],
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  // Returning null answers 401. Checked on every request, so a disabled login's tokens stop working at once (decisions R18).
  public async validate(payload: AccessTokenPayload): Promise<IWebRequestUser> {
    const identity = await this.authIdentityFacade.findIdentity({
      id: payload.sub,
    });
    if (
      !identity ||
      identity.realm !== AuthRealm.WEB ||
      identity.status !== AuthIdentityStatus.ACTIVE ||
      // Checked before the lookup: TypeORM drops an undefined where key and would return the first admin.
      !identity.userId
    ) {
      return null;
    }

    const admin = await this.userService.findAdminUser({
      id: identity.userId,
    });
    if (!admin) return null;

    // Suspension is a status of the organization, not of the identity (decisions R8).
    const organization = admin.organizationId
      ? await this.organizationFacade.findOrganization({
          id: admin.organizationId,
        })
      : null;
    if (organization?.status === OrganizationStatus.SUSPENDED) {
      throw new AuthException(AuthExceptionCodes.AUTH_004);
    }

    return {
      ...admin,
      role: Role.ADMIN,
      superAdmin: identity.superAdmin,
      identityId: identity.id,
      sessionId: payload.sid,
    };
  }
}
