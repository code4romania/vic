import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserPersonalDataDto {
  @IsString()
  @IsNotEmpty()
  identityDocumentSeries: string;

  @IsString()
  @IsNotEmpty()
  identityDocumentNumber: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsDate()
  identityDocumentIssueDate: Date;

  @IsDate()
  identityDocumentExpirationDate: Date;
}
