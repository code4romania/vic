import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateActivityLogByAdminDto {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNumber()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  hours: number;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  mentions?: string;

  @IsUUID()
  volunteerId: string;

  @IsUUID()
  @IsOptional()
  eventId?: string;

  @IsUUID()
  activityTypeId: string;
}
