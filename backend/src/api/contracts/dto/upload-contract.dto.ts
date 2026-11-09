import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

// #486: multipart form, so every field arrives as a string; an empty end date means none.
export class UploadContractDto {
  @ApiProperty()
  @IsUUID()
  volunteerId: string;

  @ApiProperty({ example: '2026-01-01' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Empty or missing: the contract never expires',
  })
  // reads the raw form value: the global pipe's implicit conversion would turn '' into an invalid date
  @Transform(({ obj }) =>
    obj.endDate === undefined || obj.endDate === '' || obj.endDate === 'null'
      ? null
      : new Date(obj.endDate),
  )
  @IsOptional()
  @IsDate()
  endDate?: Date | null;

  @ApiPropertyOptional({ example: '12/2026' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contractNumber?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  contract?: unknown;
}
