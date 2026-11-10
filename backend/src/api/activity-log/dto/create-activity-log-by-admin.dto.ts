import {
  IsDate,
  IsInt,
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

  // M12: whole hours (the column is an integer), at most a day
  @IsInt()
  @Min(1)
  @Max(24)
  hours: number;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  mentions?: string;

  @IsUUID()
  volunteerId: string;

  // null on an edit removes the event
  @IsUUID()
  @IsOptional()
  eventId?: string | null;

  @IsUUID()
  @IsOptional()
  activityTypeId?: string;
}
