import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { ApiModule } from './api/api.module';
import { validate } from './core/config/environment-config';
import { PinoLoggerConfig } from './core/config/logging.config';
import { RolesGuard } from './core/guards/roles.guard';
import { ThrottlerGuardByIP } from './core/guards/throttler.guard';
import { JsonBodyMiddleware } from './core/middleware/json-body.middlware';
import { RawBodyMiddleware } from './core/middleware/raw-body.middleware';
import { MailModule } from './modules/mail/mail.module';
import {
  CacheProviderModule,
  DatabaseProviderModule,
  QueueProviderModule,
  ThrottleModule,
} from './providers';

@Module({
  imports: [
    // Configuration modules
    LoggerModule.forRoot(PinoLoggerConfig),
    ConfigModule.forRoot({ validate, isGlobal: true }),
    EventEmitterModule.forRoot(),

    // Providers
    DatabaseProviderModule,
    CacheProviderModule,
    QueueProviderModule,
    ThrottleModule,

    // mail
    MailModule,

    // api
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
  ],
})
export class AppModule {
  onfigure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes('api/*')
      .apply(JsonBodyMiddleware)
      .forRoutes('*');
  }
}
