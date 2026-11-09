import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateVolunteerDetailsDto {
  @ApiPropertyOptional({ description: 'Where the volunteer came from' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @ApiPropertyOptional({ description: 'Internal notes of the organization' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Starred by the organization' })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
