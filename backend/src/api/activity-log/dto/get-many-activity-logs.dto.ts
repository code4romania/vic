import { Type } from 'class-transformer';
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
  @Type(() => Date)
  executionDateStart?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  executionDateEnd?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  registrationDateStart?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  registrationDateEnd?: Date;

  @IsString()
  @IsOptional()
  approvedOrRejectedById?: string;
}
