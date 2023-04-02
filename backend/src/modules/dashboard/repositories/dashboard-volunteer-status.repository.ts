import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { Repository } from 'typeorm';
import { DashboardVolunteerStatusView } from '../entities/dashboard-volunteer-status-view.entity';
import { IDashboardVolunteerStatusRepository } from '../interfaces/dashboard-volunteer-status-repository.interface';
import {
  FindDashboardVolunteerStatusChartOptions,
  IDashboardVolunteerStatusTimeseries,
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
  ): Promise<IDashboardVolunteerStatusTimeseries[]> {
    const result = this.dashboardVolunteerStatusRepository
      .createQueryBuilder('dashboard')
      .select('dashboard.Date')
      .addSelect(
        'SUM(CASE WHEN dashboard.Status = :active THEN dashboard.Count ELSE 0 END)',
        'active',
      )
      .addSelect(
        'SUM(CASE WHEN dashboard.Status = :archived THEN dashboard.Count ELSE 0 END)',
        'archived',
      )
      .where('dashboard.organization_id = :orgId', {
        orgId: findOptions.organizationId,
      })
      .andWhere('dashboard.type = :type', { type: findOptions.interval })
      .groupBy('dashboard.Date')
      // .orderBy("TO_DATE(dashboard.Date, 'DD Mon')", 'ASC')
      .orderBy('dashboard.Date', 'ASC')
      .setParameters({
        active: VolunteerStatus.ACTIVE,
        archived: VolunteerStatus.ARCHIVED,
      })
      .getRawMany();

    return result;
  }
}
