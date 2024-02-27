import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import Bull, { Queue } from 'bull';
import { ISendMailOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { QUEUES } from 'src/common/constants/constants';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue(QUEUES.MAILS) private emailQueue: Queue<ISendMailOptions>,
    private configService: ConfigService,
  ) {}

  async sendEmail(
    email: ISendMailOptions,
  ): Promise<Bull.Job<ISendMailOptions>> {
    const from = email?.from ? email.from : this.configService.get('MAIL_FROM');

    return this.emailQueue.add({
      from,
      template: './mail-template',
      ...email,
      context: {
        ...email.context,
        contactEmail: process.env.MAIL_CONTACT, // To make available the variable to all templates, especially the partials (header and footer)
      },
    });
  }
}
