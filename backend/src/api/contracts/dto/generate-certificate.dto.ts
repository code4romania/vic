import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// #490: the "Generează adeverință" form
export class GenerateCertificateDto {
  @ApiProperty()
  @IsUUID()
  volunteerId: string;

  @ApiProperty({
    example: 120,
    description: 'Total hours, prefilled and editable',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100000)
  hours: number;

  @ApiProperty({ example: 'Dosar de admitere la facultate' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  purpose: string;

  @ApiProperty({ example: '45/2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  registrationNumber: string;

  @ApiPropertyOptional({
    example: '2026-11-10',
    description: 'Defaults to today',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  issueDate?: Date;
}

export class CertificatePrefillDto {
  @ApiProperty()
  @IsUUID()
  volunteerId: string;
}
