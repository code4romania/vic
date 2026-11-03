import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ApiModule } from './api/api.module';
import { validate } from './infrastructure/config/environment-config';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { ThrottlerGuardByIP } from './infrastructure/guards/throttler.guard';
import { MaintenanceMiddleware } from './infrastructure/middleware/maintenance.middleware';
import { MobileVersionGuard } from './infrastructure/guards/mobile-version.guard';
import { AuthenticationModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UserModule } from './modules/user/user.module';
import {
  CacheProviderModule,
  DatabaseProviderModule,
  QueueProviderModule,
  RedisProviderModule,
  ThrottleModule,
} from './infrastructure/providers';
import { S3ProviderModule } from './infrastructure/providers/s3/s3-provider.module';
import { ExpoPushNotificationsProviderModule } from './infrastructure/providers/expo-push-notifications/expo-push-notifications-provider.module';

@Module({
  imports: [
    // Configuration modules
    // LoggerModule.forRoot(PinoLoggerConfig),
    ConfigModule.forRoot({ validate, isGlobal: true }),
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: true,
      // the delimiter used to segment namespaces
      delimiter: '.',
    }),
    // Providers
    DatabaseProviderModule,
    CacheProviderModule,
    QueueProviderModule,
    RedisProviderModule,
    ThrottleModule,
    S3ProviderModule,
    ExpoPushNotificationsProviderModule,

    // Modules
    MailModule,
    AuthenticationModule,
    UserModule,
    NotificationsModule,

    // API
    ApiModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuardByIP,
    },
    {
      // Global guard for all routes, doesn't require @UseGuards() in each Controller https://docs.nestjs.com/security/authentication#enable-authentication-globally
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      // 426 AUTH_011 for a /mobile request from an app below MOBILE_MIN_VERSION
      provide: APP_GUARD,
      useClass: MobileVersionGuard,
    },
  ],
})
export class AppModule {
  // Was misspelled `onfigure`, so no middleware ever ran. The RawBody / JsonBody registrations it held are
  // dropped rather than switched on silently; the files stay for now.
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer.apply(MaintenanceMiddleware).forRoutes('*');
  }
}
