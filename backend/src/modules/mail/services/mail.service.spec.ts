import { existsSync } from 'fs';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { ISendMailOptions } from '@nestjs-modules/mailer';
import { EMAIL_LOGO, MailService } from './mail.service';

describe('MailService', () => {
  it('attaches the logo inline to every email, next to its own attachments', async () => {
    const queue = { add: jest.fn() };
    const service = new MailService(
      queue as unknown as Queue<ISendMailOptions>,
      { get: () => 'VIC <no-reply@vic.test>' } as unknown as ConfigService,
    );

    await service.sendEmail({
      to: 'ana@example.ro',
      subject: 's',
      attachments: [{ filename: 'a.pdf', content: 'x' }],
      context: { title: 't', subtitle: 's' },
    });

    const [job] = queue.add.mock.calls[0];
    expect(job.attachments).toEqual([
      { filename: 'a.pdf', content: 'x' },
      EMAIL_LOGO,
    ]);
    expect(EMAIL_LOGO.cid).toBe('vic-logo');
    expect(existsSync(EMAIL_LOGO.path)).toBe(true);
  });
});
