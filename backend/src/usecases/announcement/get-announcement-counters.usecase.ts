import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';

export interface IAnnouncementCounters {
  active: number;
  inactive: number;
  archived: number;
  responses: number;
}

// #502: the counters above the announcements list, for the admin's organization.
@Injectable()
export class GetAnnouncementCountersUseCase
  implements IUseCaseService<IAnnouncementCounters>
{
  constructor(private readonly dataSource: DataSource) {}

  public async execute(organizationId: string): Promise<IAnnouncementCounters> {
    const [row] = await this.dataSource.query(
      `SELECT
         COUNT(*) FILTER (WHERE a.status = 'active') AS active,
         COUNT(*) FILTER (WHERE a.status = 'inactive') AS inactive,
         COUNT(*) FILTER (WHERE a.status = 'archived') AS archived,
         (SELECT COUNT(*) FROM announcement_response r
            JOIN announcement ra ON ra.id = r.announcement_id
           WHERE ra.organization_id = $1 AND ra.deleted_on IS NULL
             AND r.deleted_on IS NULL) AS responses
       FROM announcement a
       WHERE a.organization_id = $1 AND a.deleted_on IS NULL`,
      [organizationId],
    );
    return {
      active: +row.active,
      inactive: +row.inactive,
      archived: +row.archived,
      responses: +row.responses,
    };
  }
}
