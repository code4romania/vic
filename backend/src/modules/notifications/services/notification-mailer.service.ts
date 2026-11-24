import { Injectable } from '@nestjs/common';
import {
  NOTIFICATIONS,
  NotificationTexts,
} from 'src/common/constants/notifications';
import { mailModeFor, renderMail } from 'src/modules/mail/mail-copy';
import { MailService } from 'src/modules/mail/services/mail.service';
import { Language, UserType } from 'src/modules/user/enums/user.enum';
import { UserLanguageService } from 'src/modules/user/services/user-language.service';

export interface NotificationEmailText {
  subject: string;
  // The line under the title; '' when the subject says it all.
  body: string;
}

// The notification emails (hours approved, new event, …): one email per person, in that person's
// language. Someone who has no language yet gets both, Romanian first.
@Injectable()
export class NotificationMailerService {
  constructor(
    private readonly mailService: MailService,
    private readonly userLanguageService: UserLanguageService,
  ) {}

  // type: whose accounts the addresses are (volunteers, or admins for VOLUNTEER_LEFT).
  // build: the text, from one language's NotificationTexts.
  async send(
    emails: string[],
    type: UserType,
    build: (texts: NotificationTexts) => NotificationEmailText,
  ): Promise<void> {
    const recipients = (emails ?? []).filter(Boolean);
    if (!recipients.length) return;

    const copy = {
      [Language.RO]: this.copy(build(NOTIFICATIONS[Language.RO])),
      [Language.EN]: this.copy(build(NOTIFICATIONS[Language.EN])),
    };
    const languages = await this.userLanguageService.byEmails(recipients, type);

    await Promise.all(
      recipients.map((to) => {
        const { subject, context } = renderMail(
          { copy },
          mailModeFor(languages.get(to.toLowerCase())),
        );
        return this.mailService.sendEmail({
          to,
          subject,
          context: { ...context },
        });
      }),
    );
  }

  // The subject doubles as the title of the email.
  private copy(text: NotificationEmailText): {
    subject: string;
    title: string;
    subtitle: string;
  } {
    return { subject: text.subject, title: text.subject, subtitle: text.body };
  }
}
