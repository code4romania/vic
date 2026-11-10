import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetAccessCodesDto extends BasePaginationFilterDto {
  @SortableBy(
    'code',
    'startDate',
    'endDate',
    'usageCount',
    'createdOn',
    'createdBy.name',
  )
  orderBy?: string;
}
