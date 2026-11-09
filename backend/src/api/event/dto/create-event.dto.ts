import {
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  Max,
  Min,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';
import { TargetEventType } from 'src/modules/event/enums/target-event-type.enum';

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

  @IsEnum(TargetEventType)
  isPublic: TargetEventType;

  @IsArray()
  @IsOptional()
  targetsIds: string[];

  // Maximum number of registered volunteers; empty = no limit
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100000)
  capacity?: number;
}
