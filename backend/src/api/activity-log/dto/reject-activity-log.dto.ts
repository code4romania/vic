import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectActivityLogDto {
  // #593: required; a missing or blank reason is refused by the use case (ACTIVITY_LOG_006)
  @ApiProperty({ maxLength: 225 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsOptional()
  @MaxLength(225)
  rejectionReason?: string;
}
