import { IsEnum, IsString } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { ClientContractStatus } from 'src/modules/documents/enums/client-contract-status.enum';

export class GetVolunteerContractsDto extends BasePaginationFilterDto {
  @IsEnum(ClientContractStatus)
  status: ClientContractStatus;

  @IsString()
  volunteerId?: string;
}
