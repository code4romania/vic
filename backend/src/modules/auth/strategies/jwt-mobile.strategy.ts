import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { passportJwtSecret } from 'jwks-rsa';
import {
  CognitoConfigType,
  getCognitoProperty,
} from '../../../infrastructure/config/cognito.config';
import { AUTH_STRATEGIES } from '../auth.constants';

@Injectable()
export class MobileJwtStrategy extends PassportStrategy(
  Strategy,
  AUTH_STRATEGIES.MOBILE,
) {
  constructor() {
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

  public async validate(token: { username: string }) {
    return { user: 'test', token };
  }
}
