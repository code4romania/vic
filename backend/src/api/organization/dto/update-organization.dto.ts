import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IsNormalizedEmail } from 'src/api/auth/dto/validators';
import {
  Address,
  Description,
  OrganizationName,
  Phone,
  TaxId,
  Website,
} from './organization-fields';

// A multipart form sends a field left empty as "" (Swagger does, and so can the web form). In this edit
// form an empty or whitespace-only required field means "unchanged"; an optional one is cleared.
const isBlank = (value: unknown): boolean =>
  typeof value === 'string' && value.trim() === '';

const BlankAsUnchanged = (): PropertyDecorator =>
  Transform(({ value }) => (isBlank(value) ? undefined : value));

const BlankAsCleared = (): PropertyDecorator =>
  Transform(({ value }) => (isBlank(value) ? null : value));

// multipart/form-data: any of these fields, plus an optional `logo` file. Replaces
// UpdateOrganizationDescriptionDto.
export class UpdateOrganizationDto {
  @BlankAsUnchanged()
  @ApiPropertyOptional()
  @IsOptional()
  @OrganizationName()
  name?: string;

  @BlankAsUnchanged()
  @ApiPropertyOptional()
  @IsOptional()
  @IsNormalizedEmail()
  email?: string;

  @BlankAsUnchanged()
  @ApiPropertyOptional()
  @IsOptional()
  @Phone()
  phone?: string;

  // #469: the address, description and website are optional: empty clears them.
  @BlankAsCleared()
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Address()
  address?: string | null;

  @BlankAsCleared()
  @ApiPropertyOptional({ minLength: 50, maxLength: 250, nullable: true })
  @IsOptional()
  @Description()
  description?: string | null;

  @BlankAsCleared()
  @ApiPropertyOptional()
  @Website()
  website?: string;

  @BlankAsUnchanged()
  @ApiPropertyOptional()
  @IsOptional()
  @TaxId()
  taxId?: string;
}
