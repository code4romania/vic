import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IDashboardVolunteersStatus } from 'src/modules/dashboard/model/dashboard.model';
import { DashboardFacade } from 'src/modules/dashboard/services/dashboard.facade';

@Injectable()
export class GetDashboardVolunteersStatusUseCase
  implements IUseCaseService<IDashboardVolunteersStatus>
{
  constructor(private readonly dashboardFacade: DashboardFacade) {}

  public async execute(
    organizationId: string,
  ): Promise<IDashboardVolunteersStatus> {
    return this.dashboardFacade.countVolunteersStatus(organizationId);
  }
}
