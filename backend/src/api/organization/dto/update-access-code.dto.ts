import { Type } from 'class-transformer';
import { IsDate, ValidateIf } from 'class-validator';

export class UpdateAccessCodeDto {
  @IsDate()
  @ValidateIf((_, value) => value !== null)
  @Type(() => Date)
  endDate: Date | null;
}
