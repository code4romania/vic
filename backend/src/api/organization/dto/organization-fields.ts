import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
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

// The CUI: digits, optionally prefixed by RO.
export const TaxId = (): PropertyDecorator =>
  applyDecorators(
    trimmed,
    IsString(),
    Matches(/^(RO)?\d{2,10}$/i, { message: 'taxId must be a CUI' }),
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
