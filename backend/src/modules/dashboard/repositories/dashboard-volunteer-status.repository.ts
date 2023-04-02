import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardVolunteerStatusView } from '../entities/dashboard-volunteer-status-view.entity';
import { IDashboardVolunteerStatusRepository } from '../interfaces/dashboard-volunteer-status-repository.interface';
import {
  FindDashboardVolunteerStatusChartOptions,
  IDashboardVolunteerStatusChart,
} from '../model/dashboard.model';

@Injectable()
export class DashboardVolunteerStatusRepository
  implements IDashboardVolunteerStatusRepository
{
  constructor(
    @InjectRepository(DashboardVolunteerStatusView)
    private readonly dashboardVolunteerStatusRepository: Repository<DashboardVolunteerStatusView>,
  ) {}

  findMany(
    findOptions: FindDashboardVolunteerStatusChartOptions,
  ): Promise<IDashboardVolunteerStatusChart[]> {
    return this.dashboardVolunteerStatusRepository.find({
      where: {
        organizationId: findOptions.organizationId,
        type: findOptions.interval,
      },
    });
  }
}
