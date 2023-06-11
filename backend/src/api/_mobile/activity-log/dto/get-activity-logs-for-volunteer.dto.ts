import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { ActivityLogResolutionStatus } from 'src/modules/activity-log/enums/activity-log-resolution-status.enum';
import { ActivityLogStatusForSolvedLogs } from 'src/modules/activity-log/enums/activity-log-status.enum';

export class GetActivityLogsForVolunteerDto extends BasePaginationFilterDto {
  @IsEnum(ActivityLogResolutionStatus)
  resolutionStatus: ActivityLogResolutionStatus;

  @IsEnum(ActivityLogStatusForSolvedLogs)
  @IsOptional()
  status?: ActivityLogStatusForSolvedLogs;

  @IsString()
  @IsOptional()
  volunteerId?: string;
}
