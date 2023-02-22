import { Module } from '@nestjs/common';
import { ExceptionsModule } from 'src/infrastructure/exceptions/exceptions.module';
import { UseCaseModule } from 'src/usecases/use-case.module';
import { MailModule } from '../mail/mail.module';
import { JoinNGOListener } from './listeners/join-ngo.listener';
import { NGOEventListener } from './listeners/ngo-event.listener';
import { OthersListener } from './listeners/others.listener';
import { VolunteerHoursListener } from './listeners/volunteer-hours.listener';

@Module({
  imports: [MailModule, UseCaseModule, ExceptionsModule],
  providers: [
    JoinNGOListener,
    NGOEventListener,
    VolunteerHoursListener,
    OthersListener,
  ],
  exports: [],
})
export class NotificationsModule {}
