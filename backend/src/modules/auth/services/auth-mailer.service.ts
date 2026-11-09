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

  // Magic login links, Team invites and the cutover's transition links (VIC 2.0, #514).
  public loginLinkUrl(secret: string): string {
    return `${this.authConfig.webAppUrl}/login/link?token=${encodeURIComponent(secret)}`;
  }

  // NGO confirmation links.
  public confirmEmailUrl(secret: string): string {
    return `${this.authConfig.webAppUrl}/confirm-email?token=${encodeURIComponent(secret)}`;
  }

  // The super admins' page for pending NGOs: details and statute, with links that do not expire.
  public validationPageUrl(): string {
    return `${this.authConfig.webAppUrl}/admin/validation`;
  }

  public loginUrl(): string {
    return `${this.authConfig.webAppUrl}/login`;
  }

  public async send(to: string | string[], email: AuthEmail): Promise<void> {
    await this.mailService.sendEmail({
      to,
      subject: email.subject,
      context: { ...email.context },
    });
  }
}
