import { UTCDate } from '@date-fns/utc';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsString,
  MaxLength,
  MinDate,
  MinLength,
} from 'class-validator';
import { IsDateGreaterThanOrEqualTo } from 'src/common/validators/is-date-gte.validator';

export class CreateDocumentContractDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10)
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
  @Transform(({ value }) => {
    return new UTCDate(value);
  })
  documentDate: Date;

  @IsDate()
  @IsDateGreaterThanOrEqualTo('documentDate', {
    message:
      'Document start date must be greater than or equal to the document date',
  })
  @Transform(({ value }) => {
    return new UTCDate(value);
  })
  documentStartDate: Date;

  @IsDate()
  @IsDateGreaterThanOrEqualTo('documentStartDate', {
    message:
      'Document end date must be greater than or equal to the document start date',
  })
  @Transform(({ value }) => {
    return new UTCDate(value);
  })
  documentEndDate: Date;

  @IsString()
  volunteerId: string;

  @IsString()
  documentTemplateId: string;
}
