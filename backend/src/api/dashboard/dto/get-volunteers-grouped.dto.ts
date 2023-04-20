import { IsEnum } from 'class-validator';
import { DashboardFilteringGroups } from 'src/modules/dashboard/enums/dashboard-filtering-groups.enum';

export class GetVolunteersGroupedDto {
  @IsEnum(DashboardFilteringGroups)
  group: DashboardFilteringGroups;
}
