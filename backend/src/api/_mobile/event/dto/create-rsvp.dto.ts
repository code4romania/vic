import {
  IsBoolean,
  IsOptional,
  IsString,
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
}
