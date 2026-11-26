import { readFileSync, writeFileSync } from 'fs';
import {
  LinkNgoHubOrganizationsUseCase,
  NgoHubOrganizationRecord,
} from 'src/usecases/organization/link-ngohub-organizations.usecase';
import { runCommand } from './command-runner';

// npm run ngohub:link-orgs -- --file ngohub-orgs.json [--report report.json] [--apply]
// The file comes from `npm run oidc:export-orgs` in NGO Hub (same environment). Without --apply nothing is
// written: review the report (conflicts and candidates are never written), then run again with --apply.
runCommand('ngohub:link-orgs', async (app, args) => {
  const file = args.option('--file');
  if (!file) throw new Error('missing --file <NGO Hub export.json>');
  const apply = args.has('--apply');

  const records: NgoHubOrganizationRecord[] = JSON.parse(
    readFileSync(file, 'utf8'),
  );
  if (!Array.isArray(records)) throw new Error('the export is not a list');

  const report = await app
    .get(LinkNgoHubOrganizationsUseCase)
    .execute(records, { apply });

  console.log(
    apply ? 'ngohub:link-orgs' : 'ngohub:link-orgs DRY RUN (nothing written)',
  );
  console.table({
    'VIC organizations': report.vicOrganizations,
    'NGO Hub organizations in the export': report.ngohubOrganizations,
    'already linked (left alone)': report.alreadyLinked,
    'exact CUI matches': report.exact.length,
    [apply ? 'linked now' : 'would be linked']: apply
      ? report.applied
      : report.exact.length,
    'conflicts (not written)': report.conflicts.length,
    'candidates by name/email/phone (not written)': report.candidates.length,
    'no match': report.unmatched,
  });
  for (const conflict of report.conflicts) {
    console.log(
      `  conflict ${conflict.vicName} [${conflict.vicId}] CUI ${conflict.cui}: ${conflict.reason}`,
    );
  }
  for (const c of report.candidates) {
    console.log(
      `  candidate ${c.vicName} [${c.vicId}, CUI ${c.vicTaxId ?? '-'}] ~ NGO Hub ${c.ngohubId} ${c.ngohubName ?? ''} (CUI ${c.ngohubCui ?? '-'}) on ${c.on.join(', ')}`,
    );
  }

  const out = args.option('--report');
  if (out) {
    writeFileSync(out, JSON.stringify(report, null, 2));
    console.log(`report written to ${out}`);
  }
});
