import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { MobileJwtStrategy } from './strategies/jwt-mobile.strategy';
import { WebJwtStrategy } from './strategies/jwt-web.strategy';

@Module({
  imports: [PassportModule.register({}), UserModule],
  providers: [WebJwtStrategy, MobileJwtStrategy],
  exports: [],
})
export class AuthenticationModule {}
