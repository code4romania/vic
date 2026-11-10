import { IsOptional, IsPositive, IsString } from 'class-validator';
import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetCityDto extends BasePaginationFilterDto {
  @SortableBy('name')
  orderBy?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsPositive()
  @IsOptional()
  countyId?: number;
}
