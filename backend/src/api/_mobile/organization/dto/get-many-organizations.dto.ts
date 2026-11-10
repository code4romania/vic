import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetManyOrganizationsDto extends BasePaginationFilterDto {
  @SortableBy('name')
  orderBy?: string;
}
