import { Injectable } from '@nestjs/common';
import { AUTH_EMAILS, AuthEmail } from 'src/modules/auth/constants/auth-emails';
import { AuthIdentityStatus } from 'src/modules/auth/enums/auth.enums';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { TransitionMailService } from 'src/modules/auth/services/transition-mail.service';
import { PushNotificationsFacade } from 'src/modules/notifications/notifications.facade';
import { DataSource } from 'typeorm';

export type AnnounceTemplate = 'announce' | 'reminder' | 'back';

export interface AnnounceOptions {
  template: AnnounceTemplate;
  date?: string; // the cutover date, printed in announce and reminder
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

// The announcement emails around the cutover. announce (T-7) and reminder (T-1) read the user table,
// since no identity exists yet (decisions R3); back (after go) reads the identities and also pushes to
// every device with a push token. Every email goes through the mail queue at `perSecond` (10 by default).
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
    const pushUserIds =
      options.template === 'back' ? await this.pushUserIds() : [];

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
        title: email.context.title,
        body: email.context.subtitle,
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
        return AUTH_EMAILS[options.template](options.date);
      case 'back':
        return AUTH_EMAILS.back();
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

// Plain-text preview of an AuthEmail for the dry runs.
export function renderEmailText(to: string, email: AuthEmail): string {
  const { context } = email;
  return [
    `To: ${to}`,
    `Subject: ${email.subject}`,
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
