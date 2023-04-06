import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { RSVPGoingEnum } from 'src/modules/event/enums/rsvp-going.enum';
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
  @IsEnum(RSVPGoingEnum)
  going?: RSVPGoingEnum;
}
