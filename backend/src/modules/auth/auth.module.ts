import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { MobileJwtStrategy } from './strategies/jwt-mobile.strategy';
import { WebJwtStrategy } from './strategies/jwt-web.strategy';

@Module({
  imports: [PassportModule.register({})],
  controllers: [AuthController],
  providers: [WebJwtStrategy, MobileJwtStrategy],
  exports: [],
})
export class AuthenticationModule {}
