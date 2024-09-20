import { IsDate, IsString, MaxLength, MinDate } from 'class-validator';
import { IsDateGreaterThanOrEqualTo } from 'src/common/validators/is-date-gte.validator';

export class CreateDocumentContractDto {
  @IsString()
  @MaxLength(9)
  documentNumber: string;

  @IsDate()
  @MinDate(
    () => {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    },
    {
      message:
        'Document date must be greater than or equal to the current date',
    },
  )
  documentDate: Date;

  @IsDate()
  @IsDateGreaterThanOrEqualTo('documentDate', {
    message:
      'Document start date must be greater than or equal to the document date',
  })
  documentStartDate: Date;

  @IsDate()
  @IsDateGreaterThanOrEqualTo('documentStartDate', {
    message:
      'Document end date must be greater than or equal to the document start date',
  })
  documentEndDate: Date;

  @IsString()
  volunteerId: string;

  @IsString()
  documentTemplateId: string;
}
