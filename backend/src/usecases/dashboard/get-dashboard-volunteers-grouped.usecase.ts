import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  FindDashboardVolunteersGrouped,
  IDashboardVolunteersGrouped,
} from 'src/modules/dashboard/model/dashboard.model';
import { DashboardFacade } from 'src/modules/dashboard/services/dashboard.facade';

@Injectable()
export class GetDashboardVolunteerGroupedUsecase
  implements IUseCaseService<IDashboardVolunteersGrouped[]>
{
  constructor(private readonly dashboardFacade: DashboardFacade) {}

  public async execute(
    findOptions: FindDashboardVolunteersGrouped,
  ): Promise<IDashboardVolunteersGrouped[]> {
    return this.dashboardFacade.findVolunteersStatisticsGrouped(findOptions);
  }
}
