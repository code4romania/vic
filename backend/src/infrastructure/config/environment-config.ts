import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  validateSync,
  IsString,
  IsOptional,
  IsNumberString,
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
  COGNITO_USER_POOL_ID_WEB: string;
  @IsString()
  COGNITO_CLIENT_ID_WEB: string;
  @IsString()
  COGNITO_REGION_WEB: string;

  @IsString()
  COGNITO_USER_POOL_ID_MOBILE: string;
  @IsString()
  COGNITO_CLIENT_ID_MOBILE: string;
  @IsString()
  COGNITO_REGION_MOBILE: string;

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
  ONG_HUB_API: string;
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
