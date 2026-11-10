import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { RefreshDto } from './refresh.dto';

export class LogoutDto extends RefreshDto {
  // The device's Expo push token: removed with the session so the device stops getting the
  // user's notifications after logout.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  pushToken?: string;
}
