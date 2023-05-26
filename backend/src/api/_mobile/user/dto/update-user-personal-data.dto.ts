import {
  IsDate,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserPersonalDataDto {
  @IsString()
  @IsNotEmpty()
  @Length(2)
  identityDocumentSeries: string;

  @IsString()
  @IsNotEmpty()
  @Length(6)
  identityDocumentNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  address: string;

  @IsDate()
  identityDocumentIssueDate: Date;

  @IsDate()
  identityDocumentExpirationDate: Date;
}
