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
import { SwitchOrganizationUsecase } from '../organization/switch-organization.usecase';

@Injectable()
export class ActivateVolunteerUsecase
  implements IUseCaseService<IVolunteerModel>
{
  constructor(
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly exceptionService: ExceptionsService,
    private readonly actionsArchiveFacade: ActionsArchiveFacade,
    private readonly switchOrganizationUsecase: SwitchOrganizationUsecase,
  ) {}

  public async execute(
    volunteerId: string,
    admin: IAdminUserModel | IRegularUserModel,
  ): Promise<IVolunteerModel> {
    const volunteer = await this.getOneVolunteerUsecase.execute(volunteerId);

    if (volunteer.status !== VolunteerStatus.ARCHIVED) {
      this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_004,
      );
    }

    const activated = await this.volunteerFacade.activate(volunteerId);

    // 2. swith organization to the new active one
    await this.switchOrganizationUsecase.execute(
      volunteer.organization.id,
      volunteer.user.id,
    );

    // Track event
    this.actionsArchiveFacade.trackEvent(
      TrackedEventName.CHANGE_VOLUNTEER_STATUS,
      {
        volunteerId: volunteer.id,
        volunteerName: volunteer.user?.name,
        oldStatus: volunteer.status,
        newStatus: activated.status,
      },
      admin,
    );

    return activated;
  }
}
