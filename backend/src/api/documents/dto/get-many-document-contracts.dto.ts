import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';

export class GetManyDocumentContractsDto extends BasePaginationFilterDto {
  @IsOptional()
  @IsString()
  volunteerId?: string;

  @IsOptional()
  @IsEnum(DocumentContractStatus)
  status?: DocumentContractStatus;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;
}
