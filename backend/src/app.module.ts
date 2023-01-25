import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './common/config/environment-config';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
