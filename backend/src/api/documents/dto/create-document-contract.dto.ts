import { IsDate, IsEnum, IsString, MaxLength } from 'class-validator';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';

export class CreateDocumentContractDto {
  // TODO: validate dates

  @IsEnum(DocumentContractStatus)
  status: DocumentContractStatus;

  @IsString()
  @MaxLength(9)
  documentNumber: string;

  @IsDate()
  documentDate: Date;

  @IsDate()
  documentStartDate: Date;

  @IsDate()
  documentEndDate: Date;

  @IsString()
  volunteerId: string;

  @IsString()
  documentTemplateId: string;
}
