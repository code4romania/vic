import { BadRequestException, Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import {
  AuthIdentityStatus,
  AuthRealm,
  AuthTokenForm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { AuthRateLimitService } from 'src/modules/auth/services/auth-rate-limit.service';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { TeamAccessHelper } from './team-access.helper';

// "Send invite" on the Team page: a 14-day link to set a password, for a colleague who has none. Nothing is
// ever re-sent in bulk. One per 10 minutes and five a day per colleague (AUTH_010). The email address cannot
// be changed here.
@Injectable()
export class SendInviteUseCase
  implements IUseCaseService<{ maskedEmail: string }>
{
  constructor(
    private readonly teamAccess: TeamAccessHelper,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly rateLimit: AuthRateLimitService,
    private readonly authMailer: AuthMailerService,
    private readonly organizationFacade: OrganizationFacadeService,
  ) {}

  async execute(
    caller: IAdminUserModel,
    targetUserId: string,
  ): Promise<{ maskedEmail: string }> {
    const target = await this.teamAccess.colleague(caller, targetUserId);

    // An admin without a VIC login yet gets one now, waiting for a password.
    let identity = await this.authIdentityFacade.findIdentity({
      userId: target.id,
    });
    if (!identity) {
      identity = (
        await this.authIdentityFacade.upsertIdentity({
          realm: AuthRealm.WEB,
          email: target.email,
          status: AuthIdentityStatus.PENDING_PASSWORD,
          userId: target.id,
          legacyCognitoUsername: target.cognitoId,
        })
      ).identity;
    }
    if (
      identity.status !== AuthIdentityStatus.PENDING_PASSWORD ||
      identity.passwordHash
    ) {
      throw new BadRequestException(OrganizationExceptionMessages.ORG_009);
    }

    await this.rateLimit.assertCanInvite(identity.id);
    const { secret } = await this.oneTimeTokenService.issue({
      identity,
      type: AuthTokenType.INVITE,
      form: AuthTokenForm.LINK,
      sentById: caller.id,
    });
    const organization = await this.organizationFacade.findOrganization({
      id: caller.organizationId,
    });

    await this.authMailer.send(
      identity.email,
      AUTH_EMAILS.inviteLink(
        this.authMailer.setPasswordUrl(secret),
        organization?.name ?? 'VIC',
        caller.name,
      ),
    );

    return { maskedEmail: this.oneTimeTokenService.maskEmail(identity.email) };
  }
}
