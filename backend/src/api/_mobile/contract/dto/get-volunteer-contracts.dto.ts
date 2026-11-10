import { IsString } from 'class-validator';
import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetVolunteerContractsDto extends BasePaginationFilterDto {
  @SortableBy('createdOn', 'startDate')
  orderBy?: string;

  @IsString()
  volunteerId?: string;
}
