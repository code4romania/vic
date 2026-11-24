import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { JoinNGOListener } from './listeners/join-ngo.listener';
import { NGOEventListener } from './listeners/ngo-event.listener';
import { OthersListener } from './listeners/others.listener';
import { VolunteerHoursListener } from './listeners/volunteer-hours.listener';
import { PushNotificationsService } from 'src/modules/notifications/services/push-notifications.service';
import { PushTokensEntity } from './entities/push-tokens.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushTokensRepository } from './repositories/push-tokens.repository';
import { PushNotificationsFacade } from './notifications.facade';
import { BullModule } from '@nestjs/bull';
import { QUEUES, SENSITIVE_JOB_OPTIONS } from 'src/common/constants/constants';
import { PushTicketsCheckerProcessor } from './services/push-tickets-checker.processor';
import { NotificationsSettingsEntity } from './entities/notifications-settings.entity';
import { NotificationsSettingsRepository } from './repositories/notifications-settings.repository';
import { NotificationsSettingsFacade } from './notifications-settings.facade';
import { DocumentsListener } from './listeners/documents.listener';
import { NotificationMailerService } from './services/notification-mailer.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushTokensEntity, NotificationsSettingsEntity]),
    BullModule.registerQueue({
      name: QUEUES.PUSH_NOTIFICATIONS_TICKETS,
      // Push tokens: not kept once checked
      defaultJobOptions: SENSITIVE_JOB_OPTIONS,
    }),
    MailModule,
    // each person's language, for the push notifications and the emails
    UserModule,
  ],
  providers: [
    PushTokensRepository,
    PushNotificationsFacade,

    JoinNGOListener,
    NGOEventListener,
    VolunteerHoursListener,
    OthersListener,
    DocumentsListener,
    PushNotificationsService,
    NotificationMailerService,

    PushTicketsCheckerProcessor,

    NotificationsSettingsRepository,
    NotificationsSettingsFacade,
  ],
  exports: [PushNotificationsFacade, NotificationsSettingsFacade],
})
export class NotificationsModule {}
