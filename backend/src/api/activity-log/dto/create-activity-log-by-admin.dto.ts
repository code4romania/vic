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
  date: Date;

  @IsNumber()
  @Min(1)
  @Max(1000)
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
  @IsOptional()
  activityTypeId?: string;
}
