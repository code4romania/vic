import { AuthRealm } from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { runCommand } from './command-runner';

// npm run auth:super-admin -- <email> [--remove]
// npm run auth:super-admin            (only prints the current super admins)
// Super admin is a flag on a web identity (decision 2). Guards read it from the identity on every request,
// so the change applies to open sessions at once.
runCommand('auth:super-admin', async (app, args) => {
  const facade = app.get(AuthIdentityFacade);
  const [email] = args.positional();

  if (email) {
    const identity = await facade.findIdentity({ realm: AuthRealm.WEB, email });
    if (!identity) throw new Error(`no web identity for ${email}`);
    const superAdmin = !args.has('--remove');
    await facade.updateIdentity(identity.id, { superAdmin });
    console.log(
      `${identity.email}: super admin ${superAdmin ? 'set' : 'removed'}`,
    );
  }

  const superAdmins = await facade.findSuperAdmins();
  console.log(`Super admins (${superAdmins.length}):`);
  for (const identity of superAdmins) {
    console.log(`  ${identity.email} (${identity.status})`);
  }
});
