import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { MailProcessor } from './services/mail-processor.service';
import { MailProviderModule } from 'src/providers/mail/mail-provider.module';
import { QUEUES } from 'src/common/constants/constants';

@Global()
@Module({
  imports: [
    MailProviderModule,
    BullModule.registerQueue({
      name: QUEUES.MAILS,
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
