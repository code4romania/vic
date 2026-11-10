import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { MailProcessor } from './services/mail-processor.service';
import { MailProviderModule } from 'src/infrastructure/providers/mail/mail-provider.module';
import { QUEUES, SENSITIVE_JOB_OPTIONS } from 'src/common/constants/constants';

@Global()
@Module({
  imports: [
    MailProviderModule,
    // The emails carry login links and codes: none is kept once sent (SENSITIVE_JOB_OPTIONS).
    BullModule.registerQueue({
      name: QUEUES.MAILS,
      defaultJobOptions: SENSITIVE_JOB_OPTIONS,
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
