import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IsNormalizedEmail } from 'src/api/auth/dto/validators';
import {
  ActivityArea,
  Address,
  Description,
  OrganizationName,
  Phone,
  TaxId,
  Website,
} from './organization-fields';

// A multipart form sends a field left empty as "" (Swagger does, and so can the web form). In this edit
// form an empty or whitespace-only field means "unchanged".
const isBlank = (value: unknown): boolean =>
  typeof value === 'string' && value.trim() === '';

const BlankAsUnchanged = (): PropertyDecorator =>
  Transform(({ value }) => (isBlank(value) ? undefined : value));

// multipart/form-data: any of these fields, plus optional `logo` and `statute` files. Replaces
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

  @BlankAsUnchanged()
  @ApiPropertyOptional()
  @IsOptional()
  @Address()
  address?: string;

  @BlankAsUnchanged()
  @ApiPropertyOptional()
  @IsOptional()
  @ActivityArea()
  activityArea?: string;

  @BlankAsUnchanged()
  @ApiPropertyOptional({ minLength: 50, maxLength: 250 })
  @IsOptional()
  @Description()
  description?: string;

  // The website is the only field that may be removed: empty clears it.
  @Transform(({ value }) => (isBlank(value) ? null : value))
  @ApiPropertyOptional()
  @Website()
  website?: string;

  @BlankAsUnchanged()
  @ApiPropertyOptional()
  @IsOptional()
  @TaxId()
  taxId?: string;
}
