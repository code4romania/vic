import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { QUEUES } from 'src/common/constants/constants';

@Processor(QUEUES.MAILS)
export class MailProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process()
  public async processor(job: Job<ISendMailOptions>) {
    const mailOptions = job.data;
    return this.mailerService.sendMail(mailOptions);
  }
}
