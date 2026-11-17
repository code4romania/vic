import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';

// A volunteer from before VIC 2.0 whose app login has no profile yet. auth:migrate links them at the
// cutover, but a login made before it ran (it skips emails that already have one) or where it never ran
// (staging) would open the profile form and then fail with USER_003, because the email is taken by their
// own old profile. Once the email is proven (the emailed code, or a provider-verified email), the one live
// volunteer profile with that email that no login holds yet becomes this login's profile.
// Placeholders (has_account = false, added by an NGO) stay out: the profile form claims them with the
// volunteer's own data. Admin profiles stay out: they belong to web logins.
@Injectable()
export class LinkExistingProfileHelper {
  constructor(private readonly authIdentityFacade: AuthIdentityFacade) {}

  async link(
    identity: IAuthIdentityModel,
    manager: EntityManager,
  ): Promise<IAuthIdentityModel> {
    if (identity.realm !== AuthRealm.MOBILE || identity.userId) {
      return identity;
    }

    const profiles: { id: string }[] = await manager.query(
      `SELECT u.id
         FROM "user" u
        WHERE u.type = 'regular'
          AND u.deleted_on IS NULL
          AND u.has_account = true
          AND lower(u.email) = lower($1)
          AND NOT EXISTS (
                SELECT 1 FROM auth_identity ai
                 WHERE ai.user_id = u.id AND ai.deleted_on IS NULL
              )`,
      [identity.email],
    );
    // Emails are unique per type among live users, so more than one would be a data problem: link nothing.
    if (profiles.length !== 1) return identity;

    return this.authIdentityFacade.updateIdentity(
      identity.id,
      { userId: profiles[0].id },
      manager,
    );
  }
}
