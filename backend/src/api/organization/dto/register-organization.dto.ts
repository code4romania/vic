import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Equals, IsOptional } from 'class-validator';
import { IsNormalizedEmail } from 'src/api/auth/dto/validators';
import {
  Address,
  Description,
  OrganizationName,
  PersonName,
  Phone,
  TaxId,
  Website,
} from './organization-fields';

// multipart/form-data: these fields plus an optional `logo` image. #469: only name, CUI, email, phone,
// the declarations and the first admin are required; the rest is filled in from the Organization page.
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

  // #510: self-declaration, both required. No statute and no manual check of documents.
  @ApiProperty({
    description:
      'The organization is an NGO registered in Romania and the data is correct',
    example: true,
  })
  @Transform(
    ({ obj }) =>
      obj.declaresRegisteredNgo === true ||
      obj.declaresRegisteredNgo === 'true',
  )
  @Equals(true, { message: 'the self-declaration must be accepted' })
  declaresRegisteredNgo: boolean;

  @ApiProperty({
    description: 'The person registering may represent the organization',
    example: true,
  })
  @Transform(
    ({ obj }) =>
      obj.declaresRepresentative === true ||
      obj.declaresRepresentative === 'true',
  )
  @Equals(true, { message: 'the self-declaration must be accepted' })
  declaresRepresentative: boolean;
}
