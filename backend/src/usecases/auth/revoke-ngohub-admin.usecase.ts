import { Injectable, Logger } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import {
  AuthIdentityStatus,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { OneTimeTokenService } from 'src/modules/auth/services/one-time-token.service';
import { SessionService } from 'src/modules/auth/services/session.service';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { DataSource } from 'typeorm';

// "It was not us" from the email the other admins got when an NGO Hub admin joined by CUI: that admin's
// VIC login is disabled at once, like Disable on the Team page (sessions end, emailed links stop working).
// The link works once (AUTH_005 after). An admin can enable the person again from the Team page.
@Injectable()
export class RevokeNgoHubAdminUseCase implements IUseCaseService<void> {
  private readonly logger = new Logger(RevokeNgoHubAdminUseCase.name);

  constructor(
    private readonly oneTimeTokenService: OneTimeTokenService,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly sessionService: SessionService,
    private readonly userFacade: UserFacadeService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly dataSource: DataSource,
  ) {}

  async execute(secret: string): Promise<void> {
    const token = await this.oneTimeTokenService.peekLink(
      secret,
      AuthTokenType.NGOHUB_REVOKE,
    );
    const identity = token?.identity;
    if (!identity) throw new AuthException(AuthExceptionCodes.AUTH_005);

    await this.dataSource.transaction(async (manager) => {
      await this.oneTimeTokenService.consume(token, manager);
      await this.authIdentityFacade.updateIdentity(
        identity.id,
        { status: AuthIdentityStatus.DISABLED },
        manager,
      );
      await this.sessionService.revokeAll(identity.id, undefined, manager);
      await this.authIdentityFacade.replaceLiveTokens(
        identity.id,
        [AuthTokenType.INVITE, AuthTokenType.LOGIN, AuthTokenType.VERIFY_EMAIL],
        manager,
      );
    });

    const admin = identity.userId
      ? await this.userFacade.findAdminUser({ id: identity.userId })
      : null;
    this.logger.warn(
      `NGO Hub admin ${identity.id} (user ${identity.userId}) disabled through "it was not us"`,
    );
    if (admin) {
      // Nobody is logged in on this page: the history shows it on the admin it is about.
      this.actionsArchiveFacade.trackEvent(
        TrackedEventName.NGOHUB_ADMIN_REVOKED,
        { adminId: admin.id, adminName: admin.name },
        admin,
      );
    }
  }
}
