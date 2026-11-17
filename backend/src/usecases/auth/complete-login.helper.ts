import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthIdentityStatus } from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { IAuthTokenModel } from 'src/modules/auth/models/auth-token.model';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { LinkExistingProfileHelper } from './link-existing-profile.helper';

// Uses the emailed link or code, in one transaction: the email is proven, so it counts as confirmed,
// and a login waiting for its first use (invited, created by the cutover or by a sign-up) becomes active.
@Injectable()
export class CompleteLoginHelper {
  constructor(
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly dataSource: DataSource,
    private readonly linkExistingProfile: LinkExistingProfileHelper,
  ) {}

  async consume(
    identity: IAuthIdentityModel,
    token: Pick<IAuthTokenModel, 'id' | 'identityId' | 'type'>,
  ): Promise<IAuthIdentityModel> {
    return this.dataSource.transaction(async (manager) => {
      await this.oneTimeTokenService.consume(token, manager);
      const updated = await this.authIdentityFacade.updateIdentity(
        identity.id,
        {
          emailVerifiedAt: identity.emailVerifiedAt ?? new Date(),
          ...(identity.status === AuthIdentityStatus.PENDING
            ? { status: AuthIdentityStatus.ACTIVE }
            : {}),
        },
        manager,
      );
      // An app login without a profile gets the volunteer's existing one, if there is one to take.
      return this.linkExistingProfile.link(updated, manager);
    });
  }
}
