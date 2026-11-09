import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { ActivityLogResolutionStatus } from 'src/modules/activity-log/enums/activity-log-resolution-status.enum';
import { ActivityLogSource } from 'src/modules/activity-log/enums/activity-log-source.enum';
import { ActivityLogStatusForSolvedLogs } from 'src/modules/activity-log/enums/activity-log-status.enum';

export class GetManyActivityLogsDto extends BasePaginationFilterDto {
  // Left out: every status (#481, #482).
  @IsEnum(ActivityLogResolutionStatus)
  @IsOptional()
  resolutionStatus?: ActivityLogResolutionStatus;

  @IsEnum(ActivityLogSource)
  @IsOptional()
  source?: ActivityLogSource;

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
  approvedOrRejectedBy?: string;
}
