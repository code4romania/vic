import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { ActivityLogResolutionStatus } from 'src/modules/activity-log/enums/activity-log-resolution-status.enum';
import { ActivityLogStatusForSolvedLogs } from 'src/modules/activity-log/enums/activity-log-status.enum';

export class GetManyActivityLogsDto extends BasePaginationFilterDto {
  @IsEnum(ActivityLogResolutionStatus)
  resolutionStatus: ActivityLogResolutionStatus;

  @IsEnum(ActivityLogStatusForSolvedLogs)
  @IsOptional()
  status?: ActivityLogStatusForSolvedLogs;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsString()
  @IsOptional()
  volunteerId?: string;

  @IsDate()
  @IsOptional()
  executionDateStart?: Date;

  @IsDate()
  @IsOptional()
  executionDateEnd?: Date;

  @IsDate()
  @IsOptional()
  registrationDateStart?: Date;

  @IsDate()
  @IsOptional()
  registrationDateEnd?: Date;

  @IsString()
  @IsOptional()
  approvedOrRejectedById?: string;
}
