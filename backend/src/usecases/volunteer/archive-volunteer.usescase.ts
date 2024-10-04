import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { TrackedEventName } from 'src/modules/actions-archive/enums/action-resource-types.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOneVolunteerUsecase } from './get-one-volunteer.usecase';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import ArchiveVolunteerEvent from 'src/modules/notifications/events/join-ngo/archive-volunteer.event';
import { SyncUserOrganizationsUsecase } from '../user/sync-user-organizations.usecase';

@Injectable()
export class ArchiveVolunteerUsecase
  implements IUseCaseService<IVolunteerModel>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly eventEmitter: EventEmitter2,
    private readonly syncUseOrganizatinosUsecase: SyncUserOrganizationsUsecase,
  ) {}

  public async execute(
    volunteerId: string,
    admin: IAdminUserModel | IRegularUserModel,
  ): Promise<IVolunteerModel> {
    const volunteer = await this.getOneVolunteerUsecase.execute(volunteerId);

    if (volunteer.status !== VolunteerStatus.ACTIVE) {
      this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_003,
      );
    }

    const archived = await this.volunteerFacade.archive({
      id: volunteerId,
      archivedById: admin.id,
    });

    // sync organization data
    await this.syncUseOrganizatinosUsecase.execute(
      volunteer.user.id,
      volunteer.organization.id,
    );

    // send notifications
    this.eventEmitter.emit(
      EVENTS.JOIN_NGO.ARCHIVE_VOLUNTEER,
      new ArchiveVolunteerEvent(
        volunteer.organization.id,
        volunteer.user.id,
        volunteer.organization.name,
        volunteer.user.notificationsSettings.notificationsViaPush,
        volunteer.user.notificationsSettings.notificationsViaEmail,
        volunteer.user.email,
      ),
    );

    // Track event
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CHANGE_VOLUNTEER_STATUS,
      {
        volunteerId: volunteer.id,
        volunteerName: volunteer.user?.name,
        oldStatus: volunteer.status,
        newStatus: archived.status,
      },
      admin,
      volunteer.organization.id,
    );

    return archived;
  }
}
