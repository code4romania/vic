import { IsString } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetVolunteerContractsDto extends BasePaginationFilterDto {
  @IsString()
  volunteerId?: string;
}
