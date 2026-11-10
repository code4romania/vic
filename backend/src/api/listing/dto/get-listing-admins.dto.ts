import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetListingAdminsDto extends BasePaginationFilterDto {
  @SortableBy('name', 'createdOn')
  orderBy?: string;
}
