import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { MailService } from 'src/modules/mail/services/mail.service';
import { PushNotificationsFacade } from 'src/modules/notifications/notifications.facade';
import { AnnounceTemplate, announceCopy, cutoverDate } from './announce-copy';

// T-7 and T-1 announcements of the VIC 2.0 login, run on production 1.x (decisions R3):
//   npm run announce -- --template announce --date 2026-12-12 [--dry-run] [--no-email] [--no-push]
//   npm run announce -- --template reminder --date 2026-12-12 [--dry-run] [--no-email] [--no-push]
//   (--date is the day the 00:00–02:00 window starts; send the reminder on the evening before it)
// In the image: npm run announce:prod -- ... (dist/commands/announce.command.js).
// Emails: every user not deleted, one per address (lower case), through the mail queue at 10 per second.
// Push: every device with a push token, in batches of 500 users. --dry-run counts and prints, sends nothing.

const EMAILS_PER_SECOND = 10;
const PUSH_BATCH = 500;

const option = (argv: string[], name: string): string | undefined => {
  const inline = argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const template = option(argv, '--template') as AnnounceTemplate;
  const copy = announceCopy(template, cutoverDate(option(argv, '--date')));
  const dryRun = argv.includes('--dry-run');
  const withEmail = !argv.includes('--no-email');
  const withPush = !argv.includes('--no-push');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    const dataSource = app.get(DataSource);
    const emails: string[] = withEmail
      ? (
          await dataSource.query(
            `SELECT DISTINCT lower(trim(email)) AS email FROM "user"
              WHERE deleted_on IS NULL AND coalesce(trim(email), '') <> '' ORDER BY 1`,
          )
        ).map((row: { email: string }) => row.email)
      : [];
    const pushUserIds: string[] = withPush
      ? (
          await dataSource.query(
            `SELECT DISTINCT p.user_id FROM push_tokens p JOIN "user" u ON u.id = p.user_id
              WHERE p.deleted_on IS NULL AND u.deleted_on IS NULL`,
          )
        ).map((row: { user_id: string }) => row.user_id)
      : [];

    console.log(
      `${dryRun ? 'DRY RUN ' : ''}${template}: ${emails.length} emails, ${pushUserIds.length} users with push tokens`,
    );
    console.log(`\nEmail subject: ${copy.email.subject}`);
    console.log(`${copy.email.title}\n${copy.email.subtitle}`);
    console.log(
      `\n${copy.email.english.title}\n${copy.email.english.subtitle}`,
    );
    console.log(`\nPush: ${copy.push.title}\n${copy.push.body}\n`);
    if (dryRun) return;

    const mail = app.get(MailService);
    for (let i = 0; i < emails.length; i++) {
      if (i > 0 && i % EMAILS_PER_SECOND === 0) await sleep(1000);
      await mail.sendEmail({
        to: emails[i],
        subject: copy.email.subject,
        context: {
          title: copy.email.title,
          subtitle: copy.email.subtitle,
          english: copy.email.english,
        },
      });
    }
    console.log(`${emails.length} emails queued`);

    const push = app.get(PushNotificationsFacade);
    for (let i = 0; i < pushUserIds.length; i += PUSH_BATCH) {
      await push.send({
        userIds: pushUserIds.slice(i, i + PUSH_BATCH),
        title: copy.push.title,
        body: copy.push.body,
      });
    }
    console.log(`push sent to the devices of ${pushUserIds.length} users`);
  } finally {
    await app.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`announce: ${error?.message ?? error}`);
    process.exit(1);
  });
