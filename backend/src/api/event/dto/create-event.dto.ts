import {
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { EventAttendOptions } from 'src/modules/event/enums/event-attendance-options.enum';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';

export enum PublicEventType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}
export class CreateEventDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(1500)
  description: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(500)
  location: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  @IsOptional()
  endDate: Date;

  @IsIn([EventStatus.DRAFT, EventStatus.PUBLISHED])
  status: EventStatus.DRAFT | EventStatus.PUBLISHED;

  @IsEnum(PublicEventType)
  isPublic: PublicEventType;

  @IsEnum(EventAttendOptions)
  attendanceType: EventAttendOptions;

  @IsString()
  @MinLength(2)
  @MaxLength(250)
  @ValidateIf((o) => o.attendanceType === EventAttendOptions.MENTION)
  attendanceMention: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(1500)
  observation: string;

  @IsArray()
  @IsOptional()
  targetsIds: string[];

  @IsArray()
  tasksIds: string[];
}
