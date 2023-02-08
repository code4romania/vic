import { IsDate } from 'class-validator';

export class UpdateAccessCodeDto {
  @IsDate()
  endDate: Date;
}
