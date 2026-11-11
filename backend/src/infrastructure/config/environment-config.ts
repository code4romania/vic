import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  validateSync,
  IsString,
  IsOptional,
  IsNumberString,
  IsBooleanString,
  IsNotEmpty,
  IsInt,
  Min,
  ValidateIf,
  ValidationError,
  ValidateBy,
  ValidationArguments,
} from 'class-validator';

export enum Environment {
  Local = 'local',
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

// Staging and production refuse to start without the settings marked `required when deployed` below.
// Before, a missing MAIL_FROM sent every email from no-reply@localhost (SES rejected all of them, so
// nobody could log in) and a missing THROTTLE_* made the global rate limit NaN, which disables it.
export const DEPLOYED_ENVIRONMENTS: string[] = [
  Environment.Staging,
  Environment.Production,
];

const isDeployed = (env: { NODE_ENV?: string }): boolean =>
  DEPLOYED_ENVIRONMENTS.includes(env.NODE_ENV);

// Required (and not empty) in staging and production; optional elsewhere, but checked when present.
const RequiredWhenDeployed = (): PropertyDecorator => {
  const validateIf = ValidateIf(
    (env: EnvironmentVariables, value: unknown) =>
      isDeployed(env) || (value !== undefined && value !== ''),
  );
  const notEmpty = IsNotEmpty();
  return (target: object, key: string | symbol): void => {
    validateIf(target, key);
    notEmpty(target, key);
  };
};

// For settings every environment requires: in staging and production an empty value is refused too.
const NotEmptyWhenDeployed = (): PropertyDecorator =>
  ValidateBy({
    name: 'notEmptyWhenDeployed',
    validator: {
      validate: (value: unknown, args: ValidationArguments): boolean =>
        !isDeployed(args.object as EnvironmentVariables) ||
        (typeof value === 'string' && value.trim() !== ''),
      defaultMessage: (args: ValidationArguments): string =>
        `${args.property} must not be empty in staging and production`,
    },
  });

// Local and development only: what a missing setting falls back to. Staging and production have no defaults.
export const LOCAL_DEFAULTS: Record<string, string> = {
  MAIL_FROM: '"VIC" <no-reply@localhost>',
  THROTTLE_TTL: '60000', // milliseconds (@nestjs/throttler v6)
  THROTTLE_LIMIT: '100',
  CACHE_TTL: '60',
  RUN_MIGRATIONS: 'true',
};

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsOptional()
  DATABASE_URL: string;

  @IsString()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsNumber()
  DATABASE_PORT: number;

  @IsString()
  DATABASE_HOST: string;

  @IsString()
  REDIS_HOST: string;
  @IsNumber()
  REDIS_PORT: number;

  @IsString()
  MAIL_HOST: string;
  @IsNumberString()
  MAIL_PORT: string | number;
  @IsString()
  MAIL_USER: string;
  @IsString()
  MAIL_PASS: string;

  @IsString()
  AWS_ACCESS_KEY_ID: string;
  @IsString()
  AWS_SECRET_ACCESS_KEY: string;
  @IsString()
  @NotEmptyWhenDeployed()
  AWS_S3_BUCKET_NAME: string;
  @IsString()
  AWS_REGION: string;

  @IsString()
  EXPO_PUSH_NOTIFICATIONS_ACCESS_TOKEN: string;

  // Own authentication (see docs/auth.md).
  @IsString()
  @NotEmptyWhenDeployed()
  JWT_PRIVATE_KEY: string; // PEM, base64 encoded on one line
  @IsString()
  @NotEmptyWhenDeployed()
  JWT_PUBLIC_KEY: string; // PEM, base64 encoded on one line
  @IsString()
  @NotEmptyWhenDeployed()
  JWT_KEY_ID: string;
  @IsNumber()
  JWT_ACCESS_TTL_SECONDS: number;
  @IsNumber()
  REFRESH_TTL_DAYS_WEB: number;
  @IsNumber()
  REFRESH_TTL_DAYS_MOBILE: number;
  @IsString()
  @NotEmptyWhenDeployed()
  AUTH_TOKEN_KEY: string; // 32 random bytes, base64
  @IsString()
  @NotEmptyWhenDeployed()
  WEB_APP_URL: string;
  @IsString()
  @NotEmptyWhenDeployed()
  CORS_ORIGINS: string; // comma separated
  @IsString()
  MOBILE_MIN_VERSION: string;
  @IsBooleanString()
  MAINTENANCE_MODE: string;
  @IsOptional()
  @IsString()
  MAINTENANCE_ALLOWED_IPS: string; // comma separated
  @IsString()
  @NotEmptyWhenDeployed()
  GOOGLE_CLIENT_IDS: string; // comma separated
  @IsString()
  @NotEmptyWhenDeployed()
  APPLE_BUNDLE_ID: string;
  @IsOptional()
  @IsString()
  APPLE_SERVICES_ID: string; // web sign-in
  // Sign in with Apple token revocation on account deletion (App Store 5.1.1(v)); all three or none
  @IsOptional()
  @IsString()
  APPLE_TEAM_ID: string;
  @IsOptional()
  @IsString()
  APPLE_KEY_ID: string;
  @IsOptional()
  @IsString()
  APPLE_PRIVATE_KEY: string; // the .p8 key, base64 encoded on one line (or the PEM with \n)
  @IsOptional()
  @IsString()
  APPLE_WEB_REDIRECT_URI: string; // the redirect URI of the web Sign in with Apple, if it uses one
  @IsString()
  @NotEmptyWhenDeployed()
  MAIL_CONTACT: string;
  @IsOptional()
  @IsString()
  REDIS_KEY_PREFIX: string;

  // Sender of every email; must be an address (or domain) verified in SES.
  @RequiredWhenDeployed()
  @IsString()
  MAIL_FROM: string;

  // Global rate limit per client IP: THROTTLE_LIMIT requests per THROTTLE_TTL milliseconds.
  @RequiredWhenDeployed()
  @IsInt()
  @Min(1)
  THROTTLE_LIMIT: number;
  @RequiredWhenDeployed()
  @IsInt()
  @ValidateBy({
    name: 'throttleTtlInMilliseconds',
    validator: {
      // Local .env files often still hold 60 (seconds), which only makes the local limit ineffective.
      validate: (value: number, args: ValidationArguments): boolean =>
        !isDeployed(args.object as EnvironmentVariables) || value >= 1000,
      defaultMessage: (): string =>
        'THROTTLE_TTL is in milliseconds (at least 1000)',
    },
  })
  THROTTLE_TTL: number;

  @RequiredWhenDeployed()
  @IsInt()
  @Min(1)
  CACHE_TTL: number;

  // Host of the public bucket, <bucket>.s3.<region>.amazonaws.com: logos and the email images.
  @RequiredWhenDeployed()
  @IsString()
  AWS_S3_BUCKET_NAME_PUBLIC: string;

  // Apply pending migrations when the API boots (default true). In staging and production set it to false
  // on the service and run `npm run migration:run:prod` once per deploy (docs/deploy-production.md).
  @IsOptional()
  @IsBooleanString()
  RUN_MIGRATIONS: string;
}

export function validate(
  config: Record<string, string | number>,
): EnvironmentVariables {
  const withDefaults = isDeployed(config as { NODE_ENV?: string })
    ? config
    : { ...config, ...withoutEmpty(LOCAL_DEFAULTS, config) };

  const validatedConfig = plainToClass(EnvironmentVariables, withDefaults, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment (NODE_ENV=${config.NODE_ENV}):\n${describe(errors)}`,
    );
  }
  return validatedConfig;
}

// The defaults for the keys that are missing or empty in `config`.
function withoutEmpty(
  defaults: Record<string, string>,
  config: Record<string, string | number>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(defaults).filter(
      ([key]) => config[key] === undefined || config[key] === '',
    ),
  );
}

// One line per setting, without the values: they can be secrets.
function describe(errors: ValidationError[]): string {
  return errors
    .map(
      (error) =>
        `  - ${error.property}: ${Object.values(error.constraints ?? {}).join('; ')}`,
    )
    .join('\n');
}

// Whether TypeORM applies pending migrations at boot (RUN_MIGRATIONS, default true).
export function shouldRunMigrations(value: string | undefined): boolean {
  return value === undefined || value === '' || value === 'true';
}
