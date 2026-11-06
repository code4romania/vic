import {
  AnnounceTemplate,
  AnnounceUseCase,
  renderEmailText,
} from 'src/usecases/auth/announce.usecase';
import { runCommand } from './command-runner';

// npm run announce -- --template announce --date "12 decembrie / 12 December" [--dry-run]   (T-7)
// npm run announce -- --template reminder --date "..." [--dry-run]                          (T-1)
// npm run announce -- --release-transition    (go: sends the held transition emails at 10/s)
// npm run announce -- --template back [--dry-run]   (after go: email every identity, push every device)
// npm run announce -- --status                (the held queue: paused or not, job counts)
runCommand('announce', async (app, args) => {
  const announce = app.get(AnnounceUseCase);

  if (args.has('--status')) {
    console.log(JSON.stringify(await announce.transitionStatus(), null, 2));
    return;
  }

  if (args.has('--release-transition')) {
    const released = await announce.releaseTransition();
    console.log(
      `Released the transition queue: ${released} emails waiting, sent at 10 per second.`,
    );
    return;
  }

  const template = args.option('--template') as AnnounceTemplate;
  if (!template)
    throw new Error('pass --template, --release-transition or --status');

  const report = await announce.execute({
    template,
    date: args.option('--date'),
    dryRun: args.has('--dry-run'),
  });

  console.log(
    `${report.dryRun ? 'DRY RUN ' : ''}${report.template}: ${report.recipients} recipients` +
      (report.template === 'back'
        ? `, ${report.pushUsers} users with push tokens`
        : '') +
      (report.dryRun ? '' : `; ${report.emailsQueued} emails queued`),
  );
  if (report.dryRun && report.sample) {
    console.log('\nFirst email:\n');
    console.log(renderEmailText(report.sample.to, report.sample.email));
  }
});
