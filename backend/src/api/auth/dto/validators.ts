import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';
import { PASSWORD_REGEX } from 'src/common/constants/constants';

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

// The password rule for new passwords (same as Cognito's): 8 to 256 characters, upper, lower, digit, symbol.
export function IsStrongPassword(): PropertyDecorator {
  return applyDecorators(
    IsString(),
    Matches(PASSWORD_REGEX, { message: 'password does not meet the rules' }),
  );
}

// A password being checked, not chosen: no rule, only a length cap so argon2 never hashes megabytes.
export function IsPasswordInput(): PropertyDecorator {
  return applyDecorators(IsString(), MaxLength(256));
}

export function IsSixDigitCode(): PropertyDecorator {
  return applyDecorators(IsString(), Matches(/^\d{6}$/));
}

export function IsLinkToken(): PropertyDecorator {
  return applyDecorators(IsString(), Matches(/^[A-Za-z0-9_-]{43}$/));
}
