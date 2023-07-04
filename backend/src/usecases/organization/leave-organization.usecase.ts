import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IOrganizationWithEventsModel } from 'src/modules/organization/models/organization-with-events.model';
import { ArchiveVolunteerUsecase } from '../volunteer/archive-volunteer.usescase';
import { SwitchOrganizationUsecase } from './switch-organization.usecase';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { GetMyOrganizationsUsecase } from './get-my-organizations.usecase';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { GetOrganizationWithEventsUseCase } from './get-organization-with-events.usecase';

@Injectable()
export class LeaveOrganizationUsecase
  implements IUseCaseService<IOrganizationWithEventsModel>
{
  constructor(
    private readonly archiveVolunteerUsecase: ArchiveVolunteerUsecase,
    private readonly getMyOrganizationsUsecase: GetMyOrganizationsUsecase,
    private readonly switchOrganizationUsecase: SwitchOrganizationUsecase,
    private readonly userFacade: UserFacadeService,
    private readonly getOneOrganizationUsecase: GetOrganizationWithEventsUseCase,
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

    // 2. check if the active organization is the one archived
    if (user.activeOrganization.id === volunteer.organization.id) {
      // 2.1 get my organization profiles
      const profiles = await this.getMyOrganizationsUsecase.execute(user.id);

      // 2.2. swith organization to one of the other profiles
      if (profiles.length > 0) {
        await this.switchOrganizationUsecase.execute(profiles[0].id, user.id);
      } else {
        // 2.2.1 if there is no other profile set use active organization to null
        this.userFacade.updateRegularUser(user.id, {
          activeOrganizationId: null,
        });
      }
    }

    // 3 return organization with events
    return this.getOneOrganizationUsecase.execute(
      volunteer.organization.id,
      user.id,
    );
  }
}
