import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { VolunteerModule } from '../volunteer/volunteer.module';
import { JoinNGOListener } from './listeners/join-ngo.listener';
import { NGOEventListener } from './listeners/ngo-event.listener';
import { OthersListener } from './listeners/others.listener';
import { VolunteerHoursListener } from './listeners/volunteer-hours.listener';
import { PushNotificationsService } from 'src/modules/notifications/services/push-notifications.service';
import { PushTokensEntity } from './entities/push-tokens.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushTokensRepository } from './repositories/push-tokens.repository';
import { PushNotificationsFacade } from './notifications.facade';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushTokensEntity]),
    MailModule,
    VolunteerModule,
    UserModule,
  ],
  providers: [
    PushTokensRepository,
    PushNotificationsFacade,

    JoinNGOListener,
    NGOEventListener,
    VolunteerHoursListener,
    OthersListener,
    PushNotificationsService,
  ],
  exports: [PushNotificationsFacade],
})
export class NotificationsModule {}
