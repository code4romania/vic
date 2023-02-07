import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { passportJwtSecret } from 'jwks-rsa';
import {
  CognitoConfigType,
  getCognitoProperty,
} from '../../../infrastructure/config/cognito.config';
import { AUTH_STRATEGIES } from '../auth.constants';
import { IRequestUser } from 'src/common/interfaces/request-user.interface';

@Injectable()
export class WebJwtStrategy extends PassportStrategy(
  Strategy,
  AUTH_STRATEGIES.WEB,
) {
  constructor() {
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

  public async validate(user: IRequestUser): Promise<unknown> {
    return user;
  }
}
