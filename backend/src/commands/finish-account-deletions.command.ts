import { FinishOldAccountDeletionsUseCase } from 'src/usecases/user/finish-old-account-deletions.usecase';
import { runCommand } from './command-runner';

// #687: npm run users:finish-deletions          lists the accounts whose deletion stopped half way
//       npm run users:finish-deletions -- --apply  erases them, like a deletion today
// Run it without --apply first and check the list; it prints only ids and counts, no personal data.
runCommand('users:finish-deletions', async (app, args) => {
  const apply = args.has('--apply');
  const { found, erased, failed } = await app
    .get(FinishOldAccountDeletionsUseCase)
    .execute(apply);

  for (const item of found) {
    console.log(
      `${item.userId}  ${item.reason}  ${item.volunteers} volunteer record(s)`,
    );
  }
  console.log(`${found.length} unfinished deletion(s)`);
  if (!apply) {
    console.log('Nothing changed. Run again with --apply to erase them.');
    return;
  }
  console.log(`erased: ${erased.length}, failed: ${failed.length}`);
  if (failed.length) throw new Error(`could not erase ${failed.join(', ')}`);
});
