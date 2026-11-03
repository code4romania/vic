import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import {
  AuthConfigService,
  JWT_AUDIENCE,
  JWT_ISSUER,
} from 'src/infrastructure/config/auth.config';
import { Role } from 'src/common/enums/role.enum';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { AUTH_STRATEGIES } from '../auth.constants';
import { AuthIdentityStatus, AuthRealm } from '../enums/auth.enums';
import { IMobileRequestUser } from '../interfaces/request-user.interface';
import { AuthIdentityFacade } from '../services/auth-identity.facade';
import { AccessTokenPayload } from '../services/session.service';

@Injectable()
export class MobileJwtStrategy extends PassportStrategy(
  Strategy,
  AUTH_STRATEGIES.MOBILE,
) {
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly userService: UserFacadeService,
    authConfig: AuthConfigService,
  ) {
    super({
      secretOrKey: authConfig.publicKey,
      algorithms: ['RS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE[AuthRealm.MOBILE],
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  // Returning null answers 401. Checked on every request, so a disabled login's tokens stop working at once (decisions R18).
  public async validate(
    payload: AccessTokenPayload,
  ): Promise<IMobileRequestUser> {
    const identity = await this.authIdentityFacade.findIdentity({
      id: payload.sub,
    });
    if (
      !identity ||
      identity.realm !== AuthRealm.MOBILE ||
      identity.status !== AuthIdentityStatus.ACTIVE
    ) {
      return null;
    }

    const authenticated = {
      identityId: identity.id,
      sessionId: payload.sid,
      role: Role.VOLUNTEER as const,
    };

    // No profile yet: a stub without querying the user table, which lets POST /mobile/user create it.
    // Never look up { id: undefined }: TypeORM drops the key and would return the first user.
    if (!identity.userId) {
      return { ...authenticated, email: identity.email };
    }

    const user = await this.userService.findRegularUser({
      id: identity.userId,
    });
    if (!user) return null;

    return { ...user, ...authenticated };
  }
}
