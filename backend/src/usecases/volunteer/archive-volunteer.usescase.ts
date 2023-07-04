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

@Injectable()
export class ArchiveVolunteerUsecase
  implements IUseCaseService<IVolunteerModel>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
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
    );

    return archived;
  }
}
