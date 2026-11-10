import { IsOptional, IsUUID } from 'class-validator';
import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetVolunteerContractsDto extends BasePaginationFilterDto {
  @SortableBy('createdOn', 'startDate')
  orderBy?: string;

  // One of the user's own volunteers; defaults to the one in the active organization.
  @IsUUID()
  @IsOptional()
  volunteerId?: string;
}
