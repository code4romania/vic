import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from 'src/common/enums/role.enum';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { AUTH_STRATEGIES } from '../auth.constants';
import { AuthIdentityStatus, AuthRealm } from '../enums/auth.enums';
import { IMobileRequestUser } from '../interfaces/request-user.interface';
import { AuthIdentityFacade } from '../services/auth-identity.facade';

// The claims of a Cognito access token that the old app (1.0.x) sends.
export interface LegacyCognitoAccessToken {
  iss: string;
  token_use: string;
  client_id: string;
  username: string;
}

const claimsOf = (rawJwt: string): Partial<LegacyCognitoAccessToken> => {
  try {
    return JSON.parse(
      Buffer.from(rawJwt.split('.')[1], 'base64url').toString('utf8'),
    );
  } catch {
    return {};
  }
};

// Transition period after the 2.0 launch: the store app 1.0.x logs in with Cognito and sends a Cognito
// access token. Until LEGACY_MOBILE_UNTIL we accept it on the /mobile routes and map its username to
// the migrated identity (auth_identity.legacy_cognito_username). Only existing, migrated volunteers get
// in: an account created in Cognito after the cutover has no identity and gets 401.
// Remove this strategy, its config and the legacy routes when the period ends (issue 25).
@Injectable()
export class LegacyCognitoMobileStrategy extends PassportStrategy(
  Strategy,
  AUTH_STRATEGIES.MOBILE_LEGACY,
) {
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly userService: UserFacadeService,
    private readonly authConfig: AuthConfigService,
  ) {
    const issuer = authConfig.legacyCognitoIssuer;
    const jwks = issuer
      ? passportJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 10,
          jwksUri: `${issuer}/.well-known/jwks.json`,
        })
      : null;

    super({
      // Look the key up only for a token that claims to come from the old pool while the period lasts;
      // anything else (an expired VIC token, a token from elsewhere) fails here without a JWKS request.
      secretOrKeyProvider: (
        request: Request,
        rawJwt: string,
        done: (err: unknown, key?: string) => void,
      ) => {
        if (
          !jwks ||
          !authConfig.legacyMobileEnabled() ||
          claimsOf(rawJwt).iss !== issuer
        ) {
          return done(new Error('not a legacy token'));
        }
        return jwks(request, rawJwt, done);
      },
      issuer: issuer || 'legacy-cognito-disabled',
      algorithms: ['RS256'],
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  // Returning null answers 401, which the old app treats as a logged out session.
  public async validate(
    payload: LegacyCognitoAccessToken,
  ): Promise<IMobileRequestUser> {
    if (!this.authConfig.legacyMobileEnabled()) return null;
    if (payload.token_use !== 'access' || !payload.username) return null;

    const clientId = this.authConfig.legacyCognitoClientId;
    if (clientId && payload.client_id !== clientId) return null;

    const identity = await this.authIdentityFacade.findIdentity({
      realm: AuthRealm.MOBILE,
      legacyCognitoUsername: payload.username,
    });
    // PENDING is fine: a migrated volunteer stays PENDING until the first login in the new app.
    if (
      !identity ||
      identity.status === AuthIdentityStatus.DISABLED ||
      !identity.userId
    ) {
      return null;
    }

    const user = await this.userService.findRegularUser({
      id: identity.userId,
    });
    if (!user) return null;

    return {
      ...user,
      identityId: identity.id,
      sessionId: null, // a Cognito session, not one of ours: nothing to revoke here
      role: Role.VOLUNTEER as const,
    };
  }
}
