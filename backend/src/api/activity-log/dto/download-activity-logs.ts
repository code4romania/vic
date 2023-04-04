import { OmitType } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';

export class DownloadActivityLogsDto extends OmitType(BasePaginationFilterDto, [
  'limit',
  'page',
]) {
  @IsDate()
  @IsOptional()
  executionDateStart?: Date;

  @IsDate()
  @IsOptional()
  executionDateEnd?: Date;

  @IsString()
  @IsOptional()
  approvedOrRejectedById?: string;

  @IsUUID()
  @IsOptional()
  volunteerId?: string;
}
