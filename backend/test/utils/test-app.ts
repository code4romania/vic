import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { setupApp } from 'src/app.setup';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';
import { IAuthIdentityModel } from 'src/modules/auth/models/auth-identity.model';
import { SessionService } from 'src/modules/auth/services/session.service';
import { MailService } from 'src/modules/mail/services/mail.service';
import { TurnstileService } from 'src/infrastructure/providers/turnstile/turnstile.service';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { QUEUES } from 'src/common/constants/constants';
import { DataSource } from 'typeorm';
import { createTestAuthConfig, TestAuthKeys } from './auth-test-config';
import { FakeMailService } from './fake-mail.service';
import { createTestDataSource } from './test-data-source';

export const TURNSTILE_OK = 'turnstile-ok';

export interface TestApp {
  app: INestApplication;
  dataSource: DataSource;
  mailbox: FakeMailService;
  // A real session for the identity, so the access token carries sid like a logged-in client's.
  mintAccessToken(
    identity: Pick<IAuthIdentityModel, 'id'>,
    realm: AuthRealm,
  ): Promise<string>;
  close(): Promise<void>;
}

export interface TestAppOptions {
  // Auth settings for this app only, e.g. MAINTENANCE_MODE. ConfigModule validates the environment once
  // per process, so these replace AuthConfigService instead of process.env. The keys stay the run's keys.
  authConfig?: Record<string, string>;
}

// Boots the whole AppModule against the worker's local test database, with MailService faked.
// Expects test/setup-env.ts to have run (jest-e2e.json setupFiles).
export async function createTestApp(
  options: TestAppOptions = {},
): Promise<TestApp> {
  // Creates and migrates the database before the app connects to it.
  const migrations = await createTestDataSource();
  await migrations.destroy();

  const mailbox = new FakeMailService();
  let builder = Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(MailService)
    .useValue(mailbox)
    // No call to Cloudflare from the tests: TURNSTILE_OK passes, anything else fails.
    .overrideProvider(TurnstileService)
    .useValue({ verify: async (token: string) => token === TURNSTILE_OK });
  if (options.authConfig) {
    const keys = Object.fromEntries(
      ['JWT_PRIVATE_KEY', 'JWT_PUBLIC_KEY', 'JWT_KEY_ID', 'AUTH_TOKEN_KEY'].map(
        (key) => [key, process.env[key]],
      ),
    ) as unknown as TestAuthKeys;
    builder = builder
      .overrideProvider(AuthConfigService)
      .useValue(createTestAuthConfig(options.authConfig, keys));
  }
  const moduleRef = await builder.compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>();
  setupApp(app);
  // Listen once, on the address supertest connects to. Otherwise supertest binds a fresh port on `::` per
  // request and connects to 127.0.0.1, where another local process (an editor extension's WebSocket
  // server answered 426) can hold the same port number; and a burst of binds can hang up a socket.
  await app.listen(0, '127.0.0.1');

  const sessions = app.get(SessionService);

  return {
    app,
    dataSource: app.get(DataSource),
    mailbox,
    mintAccessToken: async (identity, realm) =>
      (await sessions.createSession(identity, realm)).accessToken,
    // Bull rejects a connection that is still connecting when its queue closes ("Connection is closed"),
    // which failed short suites at random; wait for the queues before closing.
    close: async (): Promise<void> => {
      await Promise.all(
        Object.values(QUEUES).map((name) =>
          app.get<Queue>(getQueueToken(name)).isReady(),
        ),
      );
      await app.close();
    },
  };
}
