import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EventRSVPDto {
  @IsBoolean()
  going: boolean;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(250)
  mention: string;

  @IsUUID() // TODO: remove and get it from token when we have it
  userId: string;
}

// TODO: remove and get it from token when we have it
export class EventCancelRSVPDto {
  @IsUUID()
  userId: string;
}
