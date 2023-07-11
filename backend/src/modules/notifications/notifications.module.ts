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
import { QUEUES } from 'src/common/constants/constants';
import { PushTicketsCheckerProcessor } from './services/push-tickets-checker.processor';
import { NotificationsSettingsEntity } from './entities/notifications-settings.entity';
import { NotificationsSettingsRepository } from './repositories/notifications-settings.repository';
import { NotificationsSettingsFacade } from './notifications-settings.facade';
import { DocumentsListener } from './listeners/documents.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushTokensEntity, NotificationsSettingsEntity]),
    BullModule.registerQueue({
      name: QUEUES.PUSH_NOTIFICATIONS_TICKETS,
    }),
    MailModule,
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

    PushTicketsCheckerProcessor,

    NotificationsSettingsRepository,
    NotificationsSettingsFacade,
  ],
  exports: [PushNotificationsFacade, NotificationsSettingsFacade],
})
export class NotificationsModule {}
