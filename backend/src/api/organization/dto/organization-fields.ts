import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { isValidCui, normalizeCui } from 'src/modules/organization/cui';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateBy,
} from 'class-validator';

const trimmed = Transform(({ value }) =>
  typeof value === 'string' ? value.trim() : value,
);

// The rules shared by NGO registration and the organization edit form.
export const OrganizationName = (): PropertyDecorator =>
  applyDecorators(trimmed, IsString(), MinLength(2), MaxLength(100));

export const Phone = (): PropertyDecorator =>
  applyDecorators(trimmed, IsString(), IsNotEmpty(), MaxLength(20));

export const Address = (): PropertyDecorator =>
  applyDecorators(trimmed, IsString(), MinLength(2), MaxLength(500));

export const Description = (): PropertyDecorator =>
  applyDecorators(trimmed, IsString(), MinLength(50), MaxLength(250));

// M9: the CUI, normalized (no RO prefix, spaces, dots or leading zeros) and with a valid check digit
export const TaxId = (): PropertyDecorator =>
  applyDecorators(
    Transform(({ value }) =>
      typeof value === 'string' ? normalizeCui(value.trim()) : value,
    ),
    IsString(),
    ValidateBy(
      {
        name: 'isCui',
        validator: { validate: (value) => isValidCui(value) },
      },
      { message: 'taxId must be a valid CUI' },
    ),
  );

export const Website = (): PropertyDecorator =>
  applyDecorators(
    trimmed,
    IsOptional(),
    IsUrl({ require_protocol: true }),
    MaxLength(300),
  );

export const PersonName = (): PropertyDecorator =>
  applyDecorators(trimmed, IsString(), MinLength(2), MaxLength(50));
