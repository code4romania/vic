import { IsDate, IsString, MaxLength } from 'class-validator';

export class CreateContractDto {
  @IsString()
  @MaxLength(10)
  contractNumber: string;

  @IsString()
  volunteerId: string;

  @IsString()
  templateId: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;
}
