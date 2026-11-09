import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Equals, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsNormalizedEmail } from 'src/api/auth/dto/validators';
import {
  ActivityArea,
  Address,
  Description,
  OrganizationName,
  PersonName,
  Phone,
  TaxId,
  Website,
} from './organization-fields';

// multipart/form-data: these fields plus the `statute` (PDF, required) and `logo` (image, optional) files.
export class RegisterOrganizationDto {
  @ApiProperty({ example: 'Asociatia Exemplu' })
  @OrganizationName()
  name: string;

  @ApiProperty({ example: 'contact@exemplu.ro' })
  @IsNormalizedEmail()
  email: string;

  @ApiProperty({ example: '+40700000000' })
  @Phone()
  phone: string;

  @ApiProperty({ description: 'Free text; no county or city select' })
  @Address()
  address: string;

  @ApiProperty({ example: 'Social' })
  @ActivityArea()
  activityArea: string;

  @ApiProperty({ minLength: 50, maxLength: 250 })
  @Description()
  description: string;

  @ApiPropertyOptional({ example: 'https://exemplu.ro' })
  @Website()
  website?: string;

  @ApiProperty({
    description: 'CUI, digits with an optional RO prefix',
    example: 'RO12345678',
  })
  @TaxId()
  taxId: string;

  @ApiProperty({ example: 'Ana' })
  @PersonName()
  firstName: string;

  @ApiProperty({ example: 'Popescu' })
  @PersonName()
  lastName: string;

  @ApiProperty({
    description: "The first admin's email and login",
    example: 'ana@exemplu.ro',
  })
  @IsNormalizedEmail()
  adminEmail: string;

  @ApiProperty({ example: '+40711111111' })
  @Phone()
  adminPhone: string;

  // Form fields arrive as strings, and the global pipe's implicit conversion would turn "false" into true
  // before a transform sees it, so this reads the raw form value.
  @ApiProperty({ example: true })
  @Transform(
    ({ obj }) => obj.acceptedTerms === true || obj.acceptedTerms === 'true',
  )
  @Equals(true, { message: 'the terms must be accepted' })
  acceptedTerms: boolean;

  @ApiProperty({ description: 'The Cloudflare Turnstile token from the form' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  turnstileToken: string;
}
