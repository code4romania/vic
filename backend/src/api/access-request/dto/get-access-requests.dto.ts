import { IsDate, IsNumber, IsOptional } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetAccessRequestsDto extends BasePaginationFilterDto {
  @IsNumber()
  @IsOptional()
  locationId?: number;

  @IsOptional()
  @IsDate()
  createdOnStart?: Date;

  @IsOptional()
  @IsDate()
  createdOnEnd?: Date;

  @IsOptional()
  @IsDate()
  rejectedOnStart?: Date;

  @IsOptional()
  @IsDate()
  rejectedOnEnd?: Date;
}
