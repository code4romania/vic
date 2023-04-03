import { IsDate, ValidateIf } from 'class-validator';

export class UpdateAccessCodeDto {
  @IsDate()
  @ValidateIf((_, value) => value !== null)
  endDate: Date | null;
}
