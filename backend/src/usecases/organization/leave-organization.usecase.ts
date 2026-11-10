import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { AuthIdentityStatus } from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import VolunteerLeftEvent from 'src/modules/notifications/events/join-ngo/volunteer-left.event';
import { IOrganizationWithEventsModel } from 'src/modules/organization/models/organization-with-events.model';
import { ArchiveVolunteerUsecase } from '../volunteer/archive-volunteer.usescase';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { GetOrganizationWithEventsUseCase } from './get-organization-with-events.usecase';

@Injectable()
export class LeaveOrganizationUsecase
  implements IUseCaseService<IOrganizationWithEventsModel>
{
  constructor(
    private readonly archiveVolunteerUsecase: ArchiveVolunteerUsecase,
    private readonly getOneOrganizationUsecase: GetOrganizationWithEventsUseCase,
    private readonly authIdentityFacade: AuthIdentityFacade,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(
    volunteerId: string,
    user: IRegularUserModel,
  ): Promise<IOrganizationWithEventsModel> {
    // 1. archive volunteer
    const volunteer = await this.archiveVolunteerUsecase.execute(
      volunteerId,
      user,
    );

    // 2. tell the organization's active admins (#593)
    await this.notifyAdmins(volunteer.organization, user);

    // 3 return organization with events
    return this.getOneOrganizationUsecase.execute(
      volunteer.organization.id,
      user.id,
    );
  }

  private async notifyAdmins(
    organization: { id: string; name: string },
    user: IRegularUserModel,
  ): Promise<void> {
    // Active = an admin who can log in; invited or disabled admins are left out
    const admins = (
      await this.authIdentityFacade.findByOrganizationId(organization.id)
    ).filter((identity) => identity.status === AuthIdentityStatus.ACTIVE);
    if (!admins.length) return;

    this.eventEmitter.emit(
      EVENTS.JOIN_NGO.VOLUNTEER_LEFT,
      new VolunteerLeftEvent(
        organization.id,
        admins.map((admin) => admin.userId),
        organization.name,
        admins.map((admin) => admin.email),
        user.name,
      ),
    );
  }
}
