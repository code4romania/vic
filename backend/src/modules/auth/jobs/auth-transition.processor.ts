import { ISendMailOptions } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { QUEUES } from 'src/common/constants/constants';
import { MailService } from 'src/modules/mail/services/mail.service';

// Takes the held transition emails once the queue is resumed (the queue's limiter keeps it at 10 per
// second) and hands each one to the regular mail queue.
@Processor(QUEUES.AUTH_TRANSITION)
export class AuthTransitionProcessor {
  constructor(private readonly mailService: MailService) {}

  @Process()
  public async process(job: Job<ISendMailOptions>): Promise<void> {
    await this.mailService.sendEmail(job.data);
  }
}
