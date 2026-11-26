import { Injectable } from '@nestjs/common';
import {
  AUTH_EMAILS,
  AuthEmail,
  cutoverDate,
} from 'src/modules/auth/constants/auth-emails';
import { renderMail } from 'src/modules/mail/mail-copy';
import {
  AuthIdentityStatus,
  AuthRealm,
} from 'src/modules/auth/enums/auth.enums';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { TransitionMailService } from 'src/modules/auth/services/transition-mail.service';
import { PushNotificationsFacade } from 'src/modules/notifications/notifications.facade';
import { DataSource } from 'typeorm';

export type AnnounceTemplate = 'announce' | 'reminder' | 'back' | 'app';

export interface AnnounceOptions {
  template: AnnounceTemplate;
  date?: string; // the cutover day as YYYY-MM-DD, printed in each language in announce and reminder
  dryRun?: boolean;
  perSecond?: number;
}

export interface AnnounceReport {
  template: AnnounceTemplate;
  dryRun: boolean;
  recipients: number;
  emailsQueued: number;
  pushUsers: number;
  sample: { to: string; email: AuthEmail } | null;
}

const PUSH_CHUNK = 500;

// The push goes only to phones, so it speaks of the app alone (the email also explains the web).
const BACK_PUSH_BODY = {
  ro: 'Actualizează aplicația din magazin, apoi intră cu adresa de email: primești un cod, fără parolă.',
  en: 'Update the app from the store, then log in with your email address: you get a code, no password.',
};
const PUSHES: Partial<Record<AnnounceTemplate, { ro: string; en: string }>> = {
  back: BACK_PUSH_BODY,
  app: BACK_PUSH_BODY,
};

// The announcement emails around the cutover. announce (T-7) and reminder (T-1) read the user table,
// since no identity exists yet (decisions R3); back (after go) reads the identities and also pushes to
// every device with a push token. app (the new app is in the stores, a few days after go: the store
// review runs against the live backend) emails the volunteers' identities and pushes to every device. Every email goes through the mail queue at `perSecond` (10 by default).
@Injectable()
export class AnnounceUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly authMailer: AuthMailerService,
    private readonly transitionMail: TransitionMailService,
    private readonly pushNotificationsFacade: PushNotificationsFacade,
  ) {}

  async execute(options: AnnounceOptions): Promise<AnnounceReport> {
    const email = this.build(options);
    const recipients = await this.recipients(options.template);
    const pushBody = PUSHES[options.template];
    const pushUserIds = pushBody ? await this.pushUserIds() : [];

    const report: AnnounceReport = {
      template: options.template,
      dryRun: !!options.dryRun,
      recipients: recipients.length,
      emailsQueued: 0,
      pushUsers: pushUserIds.length,
      sample: recipients.length ? { to: recipients[0], email } : null,
    };
    if (options.dryRun) return report;

    const perSecond = options.perSecond ?? 10;
    for (let i = 0; i < recipients.length; i++) {
      if (i > 0 && i % perSecond === 0) await sleep(1000);
      await this.authMailer.send(recipients[i], email);
      report.emailsQueued++;
    }

    for (let i = 0; i < pushUserIds.length; i += PUSH_CHUNK) {
      await this.pushNotificationsFacade.send({
        userIds: pushUserIds.slice(i, i + PUSH_CHUNK),
        title: { ro: email.copy.ro.title, en: email.copy.en.title },
        body: pushBody,
      });
    }

    return report;
  }

  // Go: resumes the held transition emails.
  async releaseTransition(): Promise<number> {
    return this.transitionMail.release();
  }

  async transitionStatus(): ReturnType<TransitionMailService['status']> {
    return this.transitionMail.status();
  }

  private build(options: AnnounceOptions): AuthEmail {
    switch (options.template) {
      case 'announce':
      case 'reminder':
        if (!options.date) {
          throw new Error(`--template ${options.template} needs --date`);
        }
        return AUTH_EMAILS[options.template](cutoverDate(options.date));
      case 'back':
        return AUTH_EMAILS.back();
      case 'app':
        return AUTH_EMAILS.app();
      default:
        throw new Error(`Unknown template: ${options.template}`);
    }
  }

  // One per email ignoring case. Before the cutover: user rows not deleted. After: identities not disabled.
  private async recipients(template: AnnounceTemplate): Promise<string[]> {
    const rows: { email: string }[] =
      template === 'back'
        ? await this.dataSource.query(
            `SELECT DISTINCT lower(email) AS email FROM auth_identity
              WHERE status <> $1 ORDER BY 1`,
            [AuthIdentityStatus.DISABLED],
          )
        : template === 'app'
          ? await this.dataSource.query(
              `SELECT DISTINCT lower(email) AS email FROM auth_identity
              WHERE status <> $1 AND realm = $2 ORDER BY 1`,
              [AuthIdentityStatus.DISABLED, AuthRealm.MOBILE],
            )
          : await this.dataSource.query(
              `SELECT DISTINCT lower(trim(email)) AS email FROM "user"
              WHERE deleted_on IS NULL AND coalesce(trim(email), '') <> '' ORDER BY 1`,
            );
    return rows.map((row) => row.email);
  }

  private async pushUserIds(): Promise<string[]> {
    const rows: { user_id: string }[] = await this.dataSource.query(
      `SELECT DISTINCT user_id FROM push_tokens WHERE deleted_on IS NULL`,
    );
    return rows.map((row) => row.user_id);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Plain-text preview of an AuthEmail for the dry runs. The cutover emails go to everyone in both
// languages, whatever the account language.
export function renderEmailText(to: string, email: AuthEmail): string {
  const { subject, context } = renderMail(email, 'bilingual');
  return [
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    context.title,
    context.subtitle,
    ...(context.code ? ['', `Cod: ${context.code}`] : []),
    ...(context.cta ? ['', `[${context.cta.label}] ${context.cta.link}`] : []),
    '',
    '---',
    context.english.title,
    context.english.subtitle,
  ].join('\n');
}
