import { Module } from '@nestjs/common';
import { UseCaseModule } from 'src/usecases/use-case.module';
import { MailModule } from '../mail/mail.module';
import { VolunteerModule } from '../volunteer/volunteer.module';
import { JoinNGOListener } from './listeners/join-ngo.listener';
import { NGOEventListener } from './listeners/ngo-event.listener';
import { OthersListener } from './listeners/others.listener';
import { VolunteerHoursListener } from './listeners/volunteer-hours.listener';

@Module({
  imports: [MailModule, UseCaseModule, VolunteerModule],
  providers: [
    JoinNGOListener,
    NGOEventListener,
    VolunteerHoursListener,
    OthersListener,
  ],
  exports: [],
})
export class NotificationsModule {}
