import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class EventRSVPDto {
  @IsBoolean()
  going: boolean;

  @IsString()
  @IsOptional()
  mention: string; // TODO: mandatory for events with "mention" to be checked in usecase

  @IsUUID() // TODO: remove and get it from token when we have it
  userId: string;
}

// TODO: remove and get it from token when we have it
export class EventCancelRSVPDto {
  @IsUUID()
  userId: string;
}
