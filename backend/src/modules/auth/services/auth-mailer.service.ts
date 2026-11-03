import { Injectable } from '@nestjs/common';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { MailService } from 'src/modules/mail/services/mail.service';
import { AuthEmail } from '../constants/auth-emails';

// Builds the links the emails point at and queues the emails through MailService.
@Injectable()
export class AuthMailerService {
  constructor(
    private readonly mailService: MailService,
    private readonly authConfig: AuthConfigService,
  ) {}

  // Transition, reset and invite links.
  public setPasswordUrl(secret: string): string {
    return `${this.authConfig.webAppUrl}/set-password?token=${encodeURIComponent(secret)}`;
  }

  // Mobile sign-up and NGO confirmation links.
  public confirmEmailUrl(secret: string): string {
    return `${this.authConfig.webAppUrl}/confirm-email?token=${encodeURIComponent(secret)}`;
  }

  public async send(to: string | string[], email: AuthEmail): Promise<void> {
    await this.mailService.sendEmail({
      to,
      subject: email.subject,
      context: { ...email.context },
    });
  }
}
