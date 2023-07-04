import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IOrganizationWithEventsModel } from 'src/modules/organization/models/organization-with-events.model';
import { SwitchOrganizationUsecase } from './switch-organization.usecase';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { ActivateVolunteerUsecase } from '../volunteer/activate-volunteer.usecase';

@Injectable()
export class RejoinOrganizationUsecase
  implements IUseCaseService<IOrganizationWithEventsModel>
{
  constructor(
    private readonly activateVolunteerUsecase: ActivateVolunteerUsecase,
    private readonly switchOrganizationUsecase: SwitchOrganizationUsecase,
  ) {}

  public async execute(
    volunteerId: string,
    user: IRegularUserModel,
  ): Promise<IOrganizationWithEventsModel> {
    // 1. activate volunteer
    const volunteer = await this.activateVolunteerUsecase.execute(
      volunteerId,
      user,
    );

    // 2. swith organization to the new active one
    return this.switchOrganizationUsecase.execute(
      volunteer.organization.id,
      user.id,
    );
  }
}
