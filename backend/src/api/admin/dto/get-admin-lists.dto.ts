import { IsEnum, IsOptional, Max } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';

// #511
export class GetAdminVolunteersDto extends BasePaginationFilterDto {
  @Max(100)
  limit = 10;
}

export class GetAdminOrganizationsDto extends GetAdminVolunteersDto {
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;
}
