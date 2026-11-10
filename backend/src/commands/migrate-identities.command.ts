import { MigrateIdentitiesUseCase } from 'src/usecases/auth/migrate-identities.usecase';
import { runCommand } from './command-runner';

// npm run auth:migrate -- [--dry-run] [--batch-size 500]
runCommand('auth:migrate', async (app, args) => {
  const dryRun = args.has('--dry-run');
  const batchSize = Number(args.option('--batch-size') ?? 500);

  const report = await app
    .get(MigrateIdentitiesUseCase)
    .execute({ dryRun, batchSize });

  console.log(dryRun ? 'auth:migrate DRY RUN (rolled back)' : 'auth:migrate');
  console.table({
    'user rows read': report.users,
    'admins (web identities created)': report.admins,
    'volunteers (mobile identities created)': report.volunteers,
    'social provider links (R35)': report.providerLinks,
    'already had an identity (unchanged)': report.unchanged,
    'skipped: deleted users': report.skippedDeleted,
    'skipped: no email': report.skippedNoEmail,
    'duplicates (others not imported)': report.duplicates.length,
    [dryRun ? 'transition emails (would be held)' : 'transition emails held']:
      report.emailsQueued,
  });

  if (report.duplicates.length) {
    // M18: the decision for each email, also on a dry run, to review before the real run
    const describe = (u: (typeof report.duplicates)[number]['kept']): string =>
      `${u.userId} (history ${u.history}, created ${new Date(u.createdOn).toISOString().slice(0, 10)})`;
    console.log(
      'Duplicates to fix by hand (kept: the most history, else the oldest):',
    );
    for (const d of report.duplicates) {
      console.log(
        `  ${d.realm} ${d.email}: kept ${describe(d.kept)}; not imported ${d.others.map(describe).join(', ')}`,
      );
    }
  }
});
