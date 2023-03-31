import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetPaginatedEventRSVPsDto extends BasePaginationFilterDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return value === 'true' || value === true || value === 1 || value === '1';
  })
  going?: boolean;
}
