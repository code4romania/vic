import { UTCDate } from '@date-fns/utc';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { DocumentContractStatusForDTO } from 'src/modules/documents/enums/contract-status.enum';

export class GetManyDocumentContractsDto extends BasePaginationFilterDto {
  @IsOptional()
  @IsString()
  volunteerId?: string;

  @IsOptional()
  @IsEnum(DocumentContractStatusForDTO)
  status?: DocumentContractStatusForDTO;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => {
    return new UTCDate(value);
  })
  documentStartDate?: Date;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => {
    return new UTCDate(value);
  })
  documentEndDate?: Date;
}
