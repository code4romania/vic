import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';
import { ClientContractStatus } from 'src/modules/documents/enums/client-contract-status.enum';
import { DocumentType } from 'src/modules/documents/enums/document-type.enum';

export class GetManyContractsDto extends BasePaginationFilterDto {
  @SortableBy('contractNumber', 'startDate', 'endDate', 'createdOn')
  orderBy?: string;

  @IsOptional()
  @IsString()
  volunteerName?: string;

  @IsOptional()
  @IsString()
  volunteerId?: string;

  @IsOptional()
  @IsEnum(ClientContractStatus)
  status?: ClientContractStatus;

  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;
}
