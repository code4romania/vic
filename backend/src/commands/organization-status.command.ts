import {
  SuspendOrganizationUseCase,
  UnsuspendOrganizationUseCase,
} from 'src/usecases/organization/suspend-organization.usecase';
import { runCommand } from './command-runner';

// npm run org:suspend -- <organizationId> [--reason "..."]
// npm run org:unsuspend -- <organizationId>
// The npm script passes --suspend or --unsuspend.
runCommand('org:status', async (app, args) => {
  const [organizationId] = args.positional();
  if (!organizationId) throw new Error('missing <organizationId>');

  if (args.has('--unsuspend')) {
    const organization = await app
      .get(UnsuspendOrganizationUseCase)
      .execute(organizationId);
    console.log(
      `${organization.name} (${organization.id}): ${organization.status}`,
    );
    return;
  }

  if (!args.has('--suspend')) throw new Error('pass --suspend or --unsuspend');
  const reason = args.option('--reason') ?? '(no reason given)';
  const organization = await app
    .get(SuspendOrganizationUseCase)
    .execute(organizationId);
  console.log(
    `${organization.name} (${organization.id}): ${organization.status}; reason: ${reason}`,
  );
});
