import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  FindDashboardVolunteerStatusChartOptions,
  IDashboardVolunteerStatusChart,
} from 'src/modules/dashboard/model/dashboard.model';
import { DashboardFacade } from 'src/modules/dashboard/services/dashboard.facade';

@Injectable()
export class GetDashboardVolunteerStatusTimeseriesUsecase
  implements IUseCaseService<IDashboardVolunteerStatusChart[]>
{
  constructor(private readonly dashboardFacade: DashboardFacade) {}

  public async execute(
    findOptions: FindDashboardVolunteerStatusChartOptions,
  ): Promise<IDashboardVolunteerStatusChart[]> {
    return this.dashboardFacade.findDashboardVolunteerStatusTimeseries(
      findOptions,
    );
  }
}
