import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IOrganizationWithEventsModel } from 'src/modules/organization/models/organization-with-events.model';
import { SwitchOrganizationUsecase } from './switch-organization.usecase';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { ActivateVolunteerUsecase } from '../volunteer/activate-volunteer.usecase';
import { GetOneVolunteerUsecase } from '../volunteer/get-one-volunteer.usecase';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';

@Injectable()
export class RejoinOrganizationUsecase
  implements IUseCaseService<IOrganizationWithEventsModel>
{
  constructor(
    private readonly activateVolunteerUsecase: ActivateVolunteerUsecase,
    private readonly switchOrganizationUsecase: SwitchOrganizationUsecase,
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly exceptionService: ExceptionsService,
  ) {}

  public async execute(
    volunteerId: string,
    user: IRegularUserModel,
  ): Promise<IOrganizationWithEventsModel> {
    // 1. Only a volunteer who left by themselves can rejoin; one the NGO made
    // inactive waits for the NGO to activate them again.
    const current = await this.getOneVolunteerUsecase.execute(volunteerId);
    if (current.user?.id !== user.id || current.archivedById !== user.id) {
      this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_008,
      );
    }

    // 2. activate volunteer
    const volunteer = await this.activateVolunteerUsecase.execute(
      volunteerId,
      user,
    );

    // 3. swith organization to the new active one
    return this.switchOrganizationUsecase.execute(
      volunteer.organization.id,
      user.id,
    );
  }
}
