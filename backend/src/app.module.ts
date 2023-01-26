import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ApiModule } from './api/api.module';
import { validate } from './common/config/environment-config';
import { RolesGuard } from './common/guards/roles.guard';
import { ThrottlerGuardByIP } from './common/guards/throttler.guard';
import { JsonBodyMiddleware } from './common/middleware/json-body.middlware';
import { RawBodyMiddleware } from './common/middleware/raw-body.middleware';
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
