import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateActivityLogByAdminDto {
  @IsDate()
  date: Date;

  @IsNumber()
  @Min(1)
  @Max(1000)
  hours: number;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(300)
  mentions?: string;

  @IsUUID()
  volunteerId: string;

  @IsUUID()
  eventId: string;

  @IsUUID()
  activityTypeId: string;
}
