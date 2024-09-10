import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

class LegalGuardianDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2)
  identityDocumentSeries: string;

  @IsString()
  @IsNotEmpty()
  @Length(6)
  identityDocumentNumber: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;
}
export class UpdateUserPersonalDataDto {
  @IsString()
  @IsNotEmpty()
  @Length(13)
  cnp: string;

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

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  identityDocumentIssuedBy: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LegalGuardianDto)
  legalGuardian?: LegalGuardianDto;
}
