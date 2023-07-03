import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { ClientContractStatus } from 'src/modules/documents/enums/client-contract-status.enum';

export class GetManyContractsDto extends BasePaginationFilterDto {
  @IsOptional()
  @IsString()
  volunteerName?: string;

  @IsOptional()
  @IsEnum(ClientContractStatus)
  status?: ClientContractStatus;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;
}
