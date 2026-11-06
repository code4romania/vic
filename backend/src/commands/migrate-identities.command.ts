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
    console.log('Duplicates to fix by hand (newest kept):');
    for (const d of report.duplicates) {
      console.log(
        `  ${d.realm} ${d.email}: kept ${d.keptUserId}, not imported ${d.otherUserIds.join(', ')}`,
      );
    }
  }
});
