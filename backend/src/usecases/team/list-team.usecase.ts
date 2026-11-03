import { Injectable } from '@nestjs/common';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  AuthIdentityStatus,
  AuthTokenType,
} from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';

export enum TeamMemberStatus {
  ACTIVE = 'active',
  INVITE_SENT = 'invite_sent',
  INVITE_EXPIRED = 'invite_expired',
  DISABLED = 'disabled',
  // An admin with no VIC login yet: before the cutover import, or created outside VIC. Send invite makes one.
  NO_LOGIN = 'no_login',
}

export interface ITeamMember {
  id: string; // the admin user id, used by the Team routes
  name: string;
  email: string;
  phone: string;
  status: TeamMemberStatus;
  inviteExpiresAt: Date;
  lastInviteSentAt: Date;
  lastInviteSentBy: string; // the admin's name; null for the cutover's transition link
  lastLoginAt: Date;
}

const TEAM_PAGE_SIZE = 500;

@Injectable()
export class ListTeamUseCase implements IUseCaseService<ITeamMember[]> {
  constructor(
    private readonly userFacade: UserFacadeService,
    private readonly authIdentityFacade: AuthIdentityFacade,
  ) {}

  async execute(organizationId: string): Promise<ITeamMember[]> {
    if (!organizationId) return [];

    const admins = await this.userFacade.findManyAdminUsers({
      organizationId,
      limit: TEAM_PAGE_SIZE,
      page: 1,
      orderBy: 'name',
      orderDirection: OrderDirection.ASC,
    });
    const identities =
      await this.authIdentityFacade.findByOrganizationId(organizationId);
    const byUser = new Map(
      identities.map((identity) => [identity.userId, identity]),
    );

    return Promise.all(
      admins.items.map(async (admin): Promise<ITeamMember> => {
        const identity = byUser.get(admin.id);
        const [live, latest] = identity
          ? await Promise.all([
              this.authIdentityFacade.findLiveToken(
                identity.id,
                AuthTokenType.INVITE,
              ),
              this.authIdentityFacade.findLatestToken(
                identity.id,
                AuthTokenType.INVITE,
              ),
            ])
          : [null, null];
        const sender = latest?.sentById
          ? await this.userFacade.findAdminUser({ id: latest.sentById })
          : null;

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          status: memberStatus(identity, !!live),
          inviteExpiresAt: live?.expiresAt ?? null,
          lastInviteSentAt: latest?.createdOn ?? null,
          lastInviteSentBy: sender?.name ?? null,
          lastLoginAt: identity?.lastLoginAt ?? null,
        };
      }),
    );
  }
}

function memberStatus(
  identity: { status: AuthIdentityStatus; passwordHash: string } | undefined,
  hasLiveInvite: boolean,
): TeamMemberStatus {
  if (!identity) return TeamMemberStatus.NO_LOGIN;
  if (identity.status === AuthIdentityStatus.DISABLED)
    return TeamMemberStatus.DISABLED;
  if (identity.status === AuthIdentityStatus.ACTIVE && identity.passwordHash) {
    return TeamMemberStatus.ACTIVE;
  }
  return hasLiveInvite
    ? TeamMemberStatus.INVITE_SENT
    : TeamMemberStatus.INVITE_EXPIRED;
}
