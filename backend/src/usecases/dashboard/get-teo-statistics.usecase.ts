import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ITeoStatistics } from 'src/modules/dashboard/model/dashboard.model';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetTeoStatisticsUsecase
  implements IUseCaseService<ITeoStatistics>
{
  constructor(
    private readonly organizationFacade: OrganizationFacadeService,
    private readonly volunteerFacade: VolunteerFacade,
  ) {}

  public async execute(): Promise<ITeoStatistics> {
    const numberOfActiveVolunteers = await this.volunteerFacade.count({
      status: VolunteerStatus.ACTIVE,
    });

    const numberOfOrganizations =
      await this.organizationFacade.countOrganizations();

    return Promise.resolve({
      numberOfActiveVolunteers,
      numberOfOrganizations,
    });
  }
}
