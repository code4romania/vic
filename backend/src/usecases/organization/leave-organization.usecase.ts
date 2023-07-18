import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
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

    // 3 return organization with events
    return this.getOneOrganizationUsecase.execute(
      volunteer.organization.id,
      user.id,
    );
  }
}
