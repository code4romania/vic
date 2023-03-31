import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';

export class GetAccessRequestsDto extends BasePaginationFilterDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  locationId?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdOnStart?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdOnEnd?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  rejectedOnStart?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  rejectedOnEnd?: Date;

  @IsOptional()
  @IsEnum(AccessRequestStatus)
  status?: AccessRequestStatus;
}
