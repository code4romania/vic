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
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';

@Injectable()
export class MobileJwtStrategy extends PassportStrategy(
  Strategy,
  AUTH_STRATEGIES.MOBILE,
) {
  constructor(private readonly userService: UserFacadeService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${getCognitoProperty(
          CognitoConfigType.MOBILE,
          'authority',
        )}/.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //   audience: authConfig.clientId,
      issuer: getCognitoProperty(CognitoConfigType.MOBILE, 'authority'),
      algorithms: ['RS256'],
    });
  }

  public async validate(reqUser: {
    username: string;
  }): Promise<Partial<IRegularUserModel>> {
    const user = await this.userService.findRegularUser({
      cognitoId: reqUser.username,
    });

    // if the user is not found we assume it's login and we need to request the data and we do not set the oragnization id
    return user || { cognitoId: reqUser.username };
  }
}
