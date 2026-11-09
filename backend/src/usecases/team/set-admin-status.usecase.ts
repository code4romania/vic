import { BadRequestException, Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import {
  AuthIdentityStatus,
  AuthRealm,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { SessionService } from 'src/modules/auth/services/session.service';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { DataSource } from 'typeorm';
import { TeamAccessHelper } from './team-access.helper';

// Disable or enable a colleague on the Team page; never yourself (ORG_010).
// Disable: the login is disabled, its sessions end and its unused links stop working; its tokens are refused
// on the next request. Enable: active again when it has logged in before, else back to waiting; no email
// is sent, a colleague uses Send invite (decisions R20, a recorded deviation from the design).
// Both are recorded in the activity history (DISABLE_ADMIN / ENABLE_ADMIN).
@Injectable()
export class SetAdminStatusUseCase implements IUseCaseService<void> {
  constructor(
    private readonly teamAccess: TeamAccessHelper,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly sessionService: SessionService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    caller: IAdminUserModel,
    targetUserId: string,
    enabled: boolean,
  ): Promise<void> {
    if (targetUserId && targetUserId === caller.id) {
      throw new BadRequestException(OrganizationExceptionMessages.ORG_010);
    }
    const target = await this.teamAccess.colleague(caller, targetUserId);

    let identity = await this.authIdentityFacade.findIdentity({
      userId: target.id,
    });
    if (!identity && !enabled) {
      // No login yet: create it disabled, so the cutover import (which never overwrites) keeps them out.
      identity = (
        await this.authIdentityFacade.upsertIdentity({
          realm: AuthRealm.WEB,
          email: target.email,
          status: AuthIdentityStatus.DISABLED,
          userId: target.id,
          legacyCognitoUsername: target.cognitoId,
        })
      ).identity;
    }

    if (identity) {
      await this.dataSource.transaction(async (manager) => {
        await this.authIdentityFacade.updateIdentity(
          identity.id,
          {
            status: enabled
              ? identity.lastLoginAt
                ? AuthIdentityStatus.ACTIVE
                : AuthIdentityStatus.PENDING
              : AuthIdentityStatus.DISABLED,
          },
          manager,
        );
        if (!enabled) {
          await this.sessionService.revokeAll(identity.id, undefined, manager);
          await this.authIdentityFacade.replaceLiveTokens(
            identity.id,
            [
              AuthTokenType.INVITE,
              AuthTokenType.LOGIN,
              AuthTokenType.VERIFY_EMAIL,
            ],
            manager,
          );
        }
      });
    }

    this.actionsArchiveFacade.trackEvent(
      enabled ? TrackedEventName.ENABLE_ADMIN : TrackedEventName.DISABLE_ADMIN,
      { adminId: target.id, adminName: target.name },
      caller,
    );
  }
}
