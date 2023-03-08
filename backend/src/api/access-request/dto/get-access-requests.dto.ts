import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';

export class GetAccessRequestsDto extends BasePaginationFilterDto {
  @IsNumber()
  @IsOptional()
  locationId?: number;

  @IsOptional()
  @IsEnum(AccessRequestStatus)
  status?: AccessRequestStatus;
}
