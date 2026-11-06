import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  validateSync,
  IsString,
  IsOptional,
  IsNumberString,
  IsBooleanString,
} from 'class-validator';

export enum Environment {
  Local = 'local',
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

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
  AWS_S3_BUCKET_NAME: string;
  @IsString()
  AWS_REGION: string;

  @IsString()
  EXPO_PUSH_NOTIFICATIONS_ACCESS_TOKEN: string;

  // Own authentication (see docs/auth.md).
  @IsString()
  JWT_PRIVATE_KEY: string; // PEM, base64 encoded on one line
  @IsString()
  JWT_PUBLIC_KEY: string; // PEM, base64 encoded on one line
  @IsString()
  JWT_KEY_ID: string;
  @IsNumber()
  JWT_ACCESS_TTL_SECONDS: number;
  @IsNumber()
  REFRESH_TTL_DAYS_WEB: number;
  @IsNumber()
  REFRESH_TTL_DAYS_MOBILE: number;
  @IsString()
  AUTH_TOKEN_KEY: string; // 32 random bytes, base64
  @IsString()
  WEB_APP_URL: string;
  @IsString()
  CORS_ORIGINS: string; // comma separated
  @IsString()
  MOBILE_MIN_VERSION: string;
  @IsBooleanString()
  MAINTENANCE_MODE: string;
  @IsOptional()
  @IsString()
  MAINTENANCE_ALLOWED_IPS: string; // comma separated
  @IsString()
  TURNSTILE_SECRET: string;
  @IsString()
  GOOGLE_CLIENT_IDS: string; // comma separated
  @IsString()
  FACEBOOK_APP_ID: string;
  @IsString()
  FACEBOOK_APP_SECRET: string;
  @IsString()
  APPLE_BUNDLE_ID: string;
  @IsString()
  MAIL_CONTACT: string;
  @IsOptional()
  @IsString()
  REDIS_KEY_PREFIX: string;
}

export function validate(
  config: Record<string, string | number>,
): EnvironmentVariables {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
