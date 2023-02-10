import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { passportJwtSecret } from 'jwks-rsa';
import {
  CognitoConfigType,
  getCognitoProperty,
} from '../../../infrastructure/config/cognito.config';
import { AUTH_STRATEGIES } from '../auth.constants';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

@Injectable()
export class WebJwtStrategy extends PassportStrategy(
  Strategy,
  AUTH_STRATEGIES.WEB,
) {
  constructor(private readonly userService: UserFacadeService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${getCognitoProperty(
          CognitoConfigType.WEB,
          'authority',
        )}/.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //   audience: authConfig.clientId,
      issuer: getCognitoProperty(CognitoConfigType.WEB, 'authority'),
      algorithms: ['RS256'],
    });
  }

  public async validate(reqUser: {
    username: string;
  }): Promise<Partial<IAdminUserModel>> {
    const user = await this.userService.findAdminUser({
      cognitoId: reqUser.username,
    });

    // if the user is not found we assume it's login and we need to request the data and we do not set the oragnization id
    return user || { cognitoId: reqUser.username };
  }
}
