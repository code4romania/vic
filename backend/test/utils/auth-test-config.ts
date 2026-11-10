import { ConfigService } from '@nestjs/config';
import { generateKeyPairSync, randomBytes } from 'crypto';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';

export interface TestAuthKeys {
  JWT_PRIVATE_KEY: string;
  JWT_PUBLIC_KEY: string;
  JWT_KEY_ID: string;
  AUTH_TOKEN_KEY: string;
}

// Throwaway keys, made in memory for one test run. Nothing secret is ever committed for tests.
export function generateTestAuthKeys(): TestAuthKeys {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });

  return {
    JWT_PRIVATE_KEY: Buffer.from(privateKey).toString('base64'),
    JWT_PUBLIC_KEY: Buffer.from(publicKey).toString('base64'),
    JWT_KEY_ID: 'test',
    AUTH_TOKEN_KEY: randomBytes(32).toString('base64'),
  };
}

export const TEST_AUTH_SETTINGS: Record<string, string> = {
  JWT_ACCESS_TTL_SECONDS: '900',
  REFRESH_TTL_DAYS_WEB: '7',
  REFRESH_TTL_DAYS_MOBILE: '30',
  WEB_APP_URL: 'https://vic.test',
  CORS_ORIGINS: 'https://vic.test',
  MOBILE_MIN_VERSION: '1.1.0',
  MAINTENANCE_MODE: 'false',
  TURNSTILE_SECRET: '1x0000000000000000000000000000000AA',
  GOOGLE_CLIENT_IDS: 'test-google-client',
  APPLE_BUNDLE_ID: 'org.commitglobal.vic',
};

// An AuthConfigService over a plain map, for unit specs that do not boot the app.
export function createTestAuthConfig(
  overrides: Record<string, string> = {},
  keys: TestAuthKeys = generateTestAuthKeys(),
): AuthConfigService {
  const values: Record<string, string> = {
    ...TEST_AUTH_SETTINGS,
    ...keys,
    ...overrides,
  };
  const configService = {
    get: (key: string) => values[key],
  } as unknown as ConfigService;

  return new AuthConfigService(configService);
}
