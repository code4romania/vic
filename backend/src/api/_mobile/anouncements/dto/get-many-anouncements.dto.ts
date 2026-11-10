import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetManyAnouncementsDto extends BasePaginationFilterDto {
  @SortableBy('createdOn')
  orderBy?: string;
}
