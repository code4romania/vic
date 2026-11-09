import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';

// Trims and lowercases before validating, so every email reaches the use cases normalised.
export function IsNormalizedEmail(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) =>
      typeof value === 'string' ? value.trim().toLowerCase() : value,
    ),
    IsEmail(),
    MaxLength(320),
  );
}

export function IsSixDigitCode(): PropertyDecorator {
  return applyDecorators(IsString(), Matches(/^\d{6}$/));
}

export function IsLinkToken(): PropertyDecorator {
  return applyDecorators(IsString(), Matches(/^[A-Za-z0-9_-]{43}$/));
}
