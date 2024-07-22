import { IsOptional, IsPositive, IsString } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetCityDto extends BasePaginationFilterDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsPositive()
  @IsOptional()
  countyId?: number;
}
