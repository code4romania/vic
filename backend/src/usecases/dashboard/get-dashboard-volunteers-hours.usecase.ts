import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IDashboardVolunteersHours } from 'src/modules/dashboard/model/dashboard.model';
import { DashboardFacade } from 'src/modules/dashboard/services/dashboard.facade';

@Injectable()
export class GetDashboardVolunteersHoursUseCase
  implements IUseCaseService<IDashboardVolunteersHours>
{
  constructor(private readonly dashboardFacade: DashboardFacade) {}

  public async execute(): Promise<IDashboardVolunteersHours> {
    return this.dashboardFacade.countVolunteersHours();
  }
}
