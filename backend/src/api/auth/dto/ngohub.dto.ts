import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Equals,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  Address,
  Description,
  PersonName,
  Phone,
  Website,
} from 'src/api/organization/dto/organization-fields';
import { IsLinkToken, IsNormalizedEmail } from './validators';

// What NGO Hub put on /login/ngohub/callback; the web app posts it as it came.
export class NgoHubCallbackDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  code: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  state: string;

  @ApiPropertyOptional({ description: 'RFC 9207 issuer of the response' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  iss?: string;
}

// "It was not us": the link from the email to the other admins.
export class NgoHubRevokeDto {
  @ApiProperty({ description: 'The secret from the emailed link' })
  @IsLinkToken()
  token: string;
}

// multipart/form-data: the prefilled form, plus an optional `logo` image. The CUI, the organization's name
// and the admin's email are not fields: they come from the ticket, and the pipe drops them if sent.
export class RegisterNgoHubOrganizationDto {
  @ApiProperty({ description: 'The registration ticket from the callback' })
  @IsLinkToken()
  ticket: string;

  @ApiProperty({ example: 'contact@exemplu.ro' })
  @IsNormalizedEmail()
  email: string;

  @ApiProperty({ example: '+40700000000' })
  @Phone()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Address()
  address?: string;

  @ApiPropertyOptional({ minLength: 50, maxLength: 250 })
  @IsOptional()
  @Description()
  description?: string;

  @ApiPropertyOptional()
  @Website()
  website?: string;

  @ApiProperty({ example: 'Ana' })
  @PersonName()
  firstName: string;

  @ApiProperty({ example: 'Popescu' })
  @PersonName()
  lastName: string;

  @ApiProperty({ example: '+40711111111' })
  @Phone()
  adminPhone: string;

  @ApiPropertyOptional({
    description: 'Copy the logo NGO Hub has, when no file is uploaded',
  })
  @Transform(
    ({ obj }) => obj.useNgoHubLogo === true || obj.useNgoHubLogo === 'true',
  )
  @IsOptional()
  useNgoHubLogo?: boolean;

  // Form fields arrive as strings; read the raw value (see RegisterOrganizationDto).
  @ApiProperty({ example: true })
  @Transform(
    ({ obj }) => obj.acceptedTerms === true || obj.acceptedTerms === 'true',
  )
  @Equals(true, { message: 'the terms must be accepted' })
  acceptedTerms: boolean;
}
