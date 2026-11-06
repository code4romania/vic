import * as dotenv from 'dotenv';
import { join } from 'path';
import {
  generateTestAuthKeys,
  TEST_AUTH_SETTINGS,
} from './utils/auth-test-config';
import { testDatabaseName } from './utils/test-data-source';

// Jest setupFiles for the e2e suite: runs before AppModule is imported, so ConfigModule sees these values.
dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: join(__dirname, '..', '.env.test'), override: true });

Object.assign(process.env, TEST_AUTH_SETTINGS, generateTestAuthKeys(), {
  DATABASE_NAME: testDatabaseName(),
  // Queues per Jest worker, like the databases: otherwise one suite's app takes another suite's jobs
  // (the held transition queue is paused and resumed globally).
  BULL_PREFIX: `${process.env.BULL_PREFIX || 'test-bull'}-${process.env.JEST_WORKER_ID ?? '1'}`,
});
