import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUES, SENSITIVE_JOB_OPTIONS } from 'src/common/constants/constants';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { OrganizationModule } from '../organization/organization.module';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { GoogleTokenVerifier } from './services/social/google.verifier';
import { AppleTokenVerifier } from './services/social/apple.verifier';
import { SocialTokenVerifierService } from './services/social/social-token-verifier.service';
import { MobileJwtStrategy } from './strategies/jwt-mobile.strategy';
import { WebJwtStrategy } from './strategies/jwt-web.strategy';
import { AuthIdentityEntity } from './entities/auth-identity.entity';
import { AuthTokenEntity } from './entities/auth-token.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { AuthIdentityProviderEntity } from './entities/auth-identity-provider.entity';
import { AuthIdentityRepository } from './repositories/auth-identity.repository';
import { AuthTokenRepository } from './repositories/auth-token.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { AuthIdentityProviderRepository } from './repositories/auth-identity-provider.repository';
import { AuthIdentityFacade } from './services/auth-identity.facade';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { OneTimeTokenService } from './services/one-time-token.service';
import { SessionService } from './services/session.service';
import { AuthRateLimitService } from './services/auth-rate-limit.service';
import { AuthMailerService } from './services/auth-mailer.service';
import { TransitionMailService } from './services/transition-mail.service';
import { AuthTransitionProcessor } from './jobs/auth-transition.processor';
import { AuthCleanupProcessor } from './jobs/auth-cleanup.processor';

@Module({
  imports: [
    PassportModule.register({}),
    // RS256 with the key pair from AuthConfigService; signs and verifies VIC's own access tokens.
    JwtModule.registerAsync({ useClass: AuthConfigService }),
    TypeOrmModule.forFeature([
      AuthIdentityEntity,
      AuthTokenEntity,
      RefreshTokenEntity,
      AuthIdentityProviderEntity,
    ]),
    // Held transition emails: paused by auth:migrate, resumed by `announce --release-transition`, 10 per second.
    BullModule.registerQueue({
      name: QUEUES.AUTH_TRANSITION,
      limiter: { max: 10, duration: 1000 },
      defaultJobOptions: SENSITIVE_JOB_OPTIONS,
    }),
    BullModule.registerQueue({ name: QUEUES.AUTH_MAINTENANCE }),
    UserModule,
    OrganizationModule,
  ],
  providers: [
    WebJwtStrategy,
    MobileJwtStrategy,
    AuthIdentityRepository,
    AuthTokenRepository,
    RefreshTokenRepository,
    AuthIdentityProviderRepository,
    AuthIdentityFacade,
    AuthConfigService,
    OneTimeTokenService,
    SessionService,
    AuthRateLimitService,
    AuthMailerService,
    TransitionMailService,
    AuthTransitionProcessor,
    AuthCleanupProcessor,
    SuperAdminGuard,
    GoogleTokenVerifier,
    AppleTokenVerifier,
    SocialTokenVerifierService,
  ],
  exports: [
    AuthIdentityFacade,
    AuthConfigService,
    OneTimeTokenService,
    SessionService,
    AuthRateLimitService,
    AuthMailerService,
    TransitionMailService,
    AuthCleanupProcessor,
    SuperAdminGuard,
    SocialTokenVerifierService,
  ],
})
export class AuthenticationModule {}
