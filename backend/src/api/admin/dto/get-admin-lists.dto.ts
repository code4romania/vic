import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';

// #511
export class GetAdminVolunteersDto extends BasePaginationFilterDto {
  // Not sortable: any orderBy is a 400.
  @SortableBy()
  orderBy?: string;
  // limit: at most 100, from BasePaginationFilterDto
}

export class GetAdminOrganizationsDto extends GetAdminVolunteersDto {
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  // true: only the organizations awaiting validation (confirmed, active, not validated yet);
  // false: only the validated ones
  @IsOptional()
  @Transform(({ obj }) =>
    obj.awaitingValidation === undefined || obj.awaitingValidation === ''
      ? undefined
      : obj.awaitingValidation === true || obj.awaitingValidation === 'true',
  )
  @IsBoolean()
  awaitingValidation?: boolean;
}
