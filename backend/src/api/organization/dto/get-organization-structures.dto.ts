import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';

// Departments, roles and branches.
export class GetOrganizationStructuresDto extends BasePaginationFilterDto {
  @SortableBy('name', 'numberOfMembers', 'createdOn')
  orderBy?: string;
}
