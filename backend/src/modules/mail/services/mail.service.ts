import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import Bull, { Queue } from 'bull';
import { ISendMailOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { QUEUES } from 'src/common/constants/constants';

// The logo travels with every email as an inline attachment (cid:vic-logo), so it shows
// without depending on a public bucket or the network (it was broken locally and on staging).
export const EMAIL_LOGO = {
  filename: 'vic-logo.png',
  path: join(__dirname, '..', 'assets', 'vic-logo.png'),
  cid: 'vic-logo',
};

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
      attachments: [...(email.attachments ?? []), EMAIL_LOGO],
      context: {
        ...email.context,
        contactEmail: process.env.MAIL_CONTACT, // To make available the variable to all templates, especially the partials (header and footer)
      },
    });
  }
}
