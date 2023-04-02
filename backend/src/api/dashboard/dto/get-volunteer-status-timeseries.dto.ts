import { IsEnum } from 'class-validator';
import { DashboardFilterInterval } from 'src/modules/dashboard/enums/dashboard-filter-interval.enum';

export class GetVolunteerStatusTimeseriesDto {
  @IsEnum(DashboardFilterInterval)
  interval: DashboardFilterInterval;
}
