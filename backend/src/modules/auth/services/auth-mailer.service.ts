import { Injectable } from '@nestjs/common';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { mailModeFor, renderMail } from 'src/modules/mail/mail-copy';
import { MailService } from 'src/modules/mail/services/mail.service';
import { Language, UserType } from 'src/modules/user/enums/user.enum';
import { UserLanguageService } from 'src/modules/user/services/user-language.service';
import { AuthEmail } from '../constants/auth-emails';

// Builds the links the emails point at and queues the emails through MailService.
@Injectable()
export class AuthMailerService {
  constructor(
    private readonly mailService: MailService,
    private readonly authConfig: AuthConfigService,
    private readonly userLanguageService: UserLanguageService,
  ) {}

  // Magic login links, Team invites and the cutover's transition links (VIC 2.0, #514).
  public loginLinkUrl(secret: string): string {
    return `${this.authConfig.webAppUrl}/login/link?token=${encodeURIComponent(secret)}`;
  }

  // NGO confirmation links.
  public confirmEmailUrl(secret: string): string {
    return `${this.authConfig.webAppUrl}/confirm-email?token=${encodeURIComponent(secret)}`;
  }

  // Login with NGO Hub: "it was not us", to the other admins when an NGO Hub admin joined by CUI.
  public ngohubRevokeUrl(secret: string): string {
    return `${this.authConfig.webAppUrl}/login/ngohub/not-us?token=${encodeURIComponent(secret)}`;
  }

  // The super admins' page for pending NGOs: their details, to validate or suspend.
  public validationPageUrl(): string {
    return `${this.authConfig.webAppUrl}/admin/validation`;
  }

  public loginUrl(): string {
    return `${this.authConfig.webAppUrl}/login`;
  }

  // In the recipient's language when VIC knows it; without one the email is bilingual
  // (Romanian first, English below).
  public async send(
    to: string | string[],
    email: AuthEmail,
    language?: Language | null,
  ): Promise<void> {
    const { subject, context } = renderMail(email, mailModeFor(language));
    await this.mailService.sendEmail({ to, subject, context: { ...context } });
  }

  // The language of the user behind a login; null when the login has no user yet.
  public async languageOfUser(
    userId?: string | null,
  ): Promise<Language | null> {
    return userId ? this.userLanguageService.byUserId(userId) : null;
  }

  // One email per person, each in their own language (the account with that email, of that type).
  public async sendToEach(
    emails: string[],
    type: UserType,
    email: AuthEmail,
  ): Promise<void> {
    const languages = await this.userLanguageService.byEmails(emails, type);
    await Promise.all(
      emails.map((to) =>
        this.send(to, email, languages.get(to.toLowerCase()) ?? null),
      ),
    );
  }
}
