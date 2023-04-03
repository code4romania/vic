import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SEX } from 'src/modules/user/enums/user.enum';
import { VolunteerEntity } from 'src/modules/volunteer/entities/volunteer.entity';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { Repository } from 'typeorm';
import { DashboardVolunteerStatusView } from '../entities/dashboard-volunteer-status-view.entity';
import { DashboardFilteringGroups } from '../enums/dashboard-filtering-groups.enum';
import { IDashboardRepository } from '../interfaces/dashboard-volunteer-status-repository.interface';
import {
  FindDashboardVolunteersGrouped,
  FindDashboardVolunteerStatusChartOptions,
  IDashaboardVolunteersGrouped,
  IDashboardVolunteerStatusTimeseries,
} from '../model/dashboard.model';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(
    @InjectRepository(DashboardVolunteerStatusView)
    private readonly dashboardVolunteerStatusRepository: Repository<DashboardVolunteerStatusView>,
    @InjectRepository(VolunteerEntity)
    private readonly volunteerRepository: Repository<VolunteerEntity>,
  ) {}

  findDashboardVolunteerStatusTimeseries(
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
      .orderBy('dashboard.Date', 'ASC')
      .setParameters({
        active: VolunteerStatus.ACTIVE,
        archived: VolunteerStatus.ARCHIVED,
      })
      .getRawMany();

    return result;
  }

  async findVolunteersStatisticsGrouped(
    findOptions: FindDashboardVolunteersGrouped,
  ): Promise<IDashaboardVolunteersGrouped[]> {
    const query = this.volunteerRepository
      .createQueryBuilder('v')
      .leftJoin('v.user', 'u')
      // .select()
      .where('v.organization_id = :orgId', {
        orgId: findOptions.organizationId,
      });

    if (findOptions.group === DashboardFilteringGroups.AGE) {
      query
        .select('COUNT(*)', 'count')
        .addSelect(
          'CASE ' +
            "WHEN extract(year from age(u.birthday)) BETWEEN 15 AND 20 THEN '15-20' " +
            "WHEN extract(year from age(u.birthday)) BETWEEN 21 AND 25 THEN '21-25' " +
            "ELSE '25+' " +
            'END',
          'name',
        )
        .groupBy('u.birthday, v.organization_id');
    }

    if (findOptions.group === DashboardFilteringGroups.SEX) {
      query
        .select('COUNT(*)', 'count')
        .addSelect(
          'CASE ' +
            'WHEN u.sex = :male THEN u.sex ' +
            'WHEN u.sex = :female THEN u.sex ' +
            "ELSE 'other' " +
            'END',
          'name',
        )
        .groupBy('u.sex, v.organization_id')
        .setParameters({
          male: SEX.MALE,
          female: SEX.FEMALE,
        });
    }

    if (findOptions.group === DashboardFilteringGroups.LOCATION) {
      query
        .select('COUNT(*)', 'count')
        .addSelect('county.name', 'name')
        .leftJoin('u.location', 'city')
        .leftJoin('city.county', 'county')
        .groupBy('v.organization_id, county.id, county.name');
    }

    return query.getRawMany();
  }
}
