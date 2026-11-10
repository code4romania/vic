import 'reflect-metadata';
import {
  LOCAL_DEFAULTS,
  shouldRunMigrations,
  validate,
} from './environment-config';

// A complete production environment; each case removes or changes one setting.
const PRODUCTION: Record<string, string> = {
  NODE_ENV: 'production',
  PORT: '3000',
  DATABASE_USER: 'vic',
  DATABASE_PASSWORD: 'secret',
  DATABASE_NAME: 'vic',
  DATABASE_PORT: '5432',
  DATABASE_HOST: 'db.internal',
  REDIS_HOST: 'redis.internal',
  REDIS_PORT: '6379',
  MAIL_HOST: 'email-smtp.eu-west-1.amazonaws.com',
  MAIL_PORT: '587',
  MAIL_USER: 'user',
  MAIL_PASS: 'pass',
  MAIL_FROM: '"VIC" <no-reply@vic.ro>',
  MAIL_CONTACT: 'contact@vic.ro',
  AWS_ACCESS_KEY_ID: 'id',
  AWS_SECRET_ACCESS_KEY: 'key',
  AWS_S3_BUCKET_NAME: 'vic-private',
  AWS_S3_BUCKET_NAME_PUBLIC: 'vic-public.s3.eu-west-1.amazonaws.com',
  AWS_REGION: 'eu-west-1',
  EXPO_PUSH_NOTIFICATIONS_ACCESS_TOKEN: 'expo',
  JWT_PRIVATE_KEY: 'cHJpdmF0ZQ==',
  JWT_PUBLIC_KEY: 'cHVibGlj',
  JWT_KEY_ID: '2026-11',
  JWT_ACCESS_TTL_SECONDS: '900',
  REFRESH_TTL_DAYS_WEB: '7',
  REFRESH_TTL_DAYS_MOBILE: '30',
  AUTH_TOKEN_KEY: 'a2V5',
  WEB_APP_URL: 'https://vic.ro',
  CORS_ORIGINS: 'https://vic.ro',
  MOBILE_MIN_VERSION: '1.1.0',
  MAINTENANCE_MODE: 'false',
  TURNSTILE_SECRET: 'turnstile',
  GOOGLE_CLIENT_IDS: 'google',
  APPLE_BUNDLE_ID: 'org.commitglobal.vic',
  THROTTLE_TTL: '60000',
  THROTTLE_LIMIT: '100',
  CACHE_TTL: '60',
};

const without = (
  env: Record<string, string>,
  key: string,
): Record<string, string> => {
  const copy = { ...env };
  delete copy[key];
  return copy;
};

describe('validate (environment)', () => {
  it('accepts a complete production environment', () => {
    const config = validate(PRODUCTION);
    expect(config.THROTTLE_LIMIT).toBe(100);
    expect(config.MAIL_FROM).toBe('"VIC" <no-reply@vic.ro>');
  });

  it.each([
    'MAIL_FROM',
    'THROTTLE_TTL',
    'THROTTLE_LIMIT',
    'CACHE_TTL',
    'AWS_S3_BUCKET_NAME_PUBLIC',
    'JWT_PRIVATE_KEY',
    'JWT_PUBLIC_KEY',
    'AUTH_TOKEN_KEY',
    'WEB_APP_URL',
    'CORS_ORIGINS',
  ])('refuses to start in production and staging without %s', (key) => {
    expect(() => validate(without(PRODUCTION, key))).toThrow(key);
    expect(() =>
      validate({ ...without(PRODUCTION, key), NODE_ENV: 'staging' }),
    ).toThrow(key);
  });

  it.each([
    'MAIL_FROM',
    'THROTTLE_TTL',
    'AWS_S3_BUCKET_NAME_PUBLIC',
    'JWT_PRIVATE_KEY',
    'AUTH_TOKEN_KEY',
    'CORS_ORIGINS',
  ])('refuses an empty %s in production', (key) => {
    expect(() => validate({ ...PRODUCTION, [key]: '' })).toThrow(key);
  });

  it('refuses a throttle that is not a number, or a TTL in seconds instead of milliseconds', () => {
    expect(() => validate({ ...PRODUCTION, THROTTLE_LIMIT: 'many' })).toThrow(
      'THROTTLE_LIMIT',
    );
    expect(() => validate({ ...PRODUCTION, THROTTLE_TTL: '60' })).toThrow(
      'THROTTLE_TTL is in milliseconds',
    );
  });

  it('does not print the values of the settings it refuses', () => {
    expect(() =>
      validate({ ...without(PRODUCTION, 'MAIL_FROM'), THROTTLE_LIMIT: 'x' }),
    ).toThrow(
      expect.objectContaining({
        message: expect.not.stringContaining('secret'),
      }),
    );
  });

  it('fills the local defaults for the optional settings in local and development', () => {
    for (const NODE_ENV of ['local', 'development']) {
      const env: Record<string, string> = {
        ...PRODUCTION,
        NODE_ENV,
        MAIL_FROM: '',
      };
      for (const key of [
        'THROTTLE_TTL',
        'THROTTLE_LIMIT',
        'CACHE_TTL',
        'AWS_S3_BUCKET_NAME_PUBLIC',
      ]) {
        delete env[key];
      }
      const config = validate(env);
      expect(config.MAIL_FROM).toBe(LOCAL_DEFAULTS.MAIL_FROM);
      expect(config.THROTTLE_TTL).toBe(60000);
      expect(config.THROTTLE_LIMIT).toBe(100);
      expect(config.CACHE_TTL).toBe(60);
      expect(config.RUN_MIGRATIONS).toBe('true');
    }
  });

  it('keeps the local values that are set', () => {
    const config = validate({
      ...PRODUCTION,
      NODE_ENV: 'local',
      THROTTLE_LIMIT: '1000',
      THROTTLE_TTL: '60',
      RUN_MIGRATIONS: 'false',
    });
    expect(config.THROTTLE_LIMIT).toBe(1000);
    expect(config.THROTTLE_TTL).toBe(60);
    expect(config.RUN_MIGRATIONS).toBe('false');
  });
});

describe('shouldRunMigrations', () => {
  it('runs them unless RUN_MIGRATIONS is false', () => {
    expect(shouldRunMigrations(undefined)).toBe(true);
    expect(shouldRunMigrations('')).toBe(true);
    expect(shouldRunMigrations('true')).toBe(true);
    expect(shouldRunMigrations('false')).toBe(false);
  });
});
