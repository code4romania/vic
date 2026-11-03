import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

// Specs that need Postgres use separate databases (DATABASE_TEST_NAME, default vic_test, plus the Jest
// worker id) on the local docker compose server. It refuses any other host, so a spec can never touch staging or production.
function testConnectionOptions(): {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
} {
  const host = process.env.DATABASE_HOST;
  if (!LOCAL_HOSTS.includes(host)) {
    throw new Error(
      `Database specs only run against a local database; DATABASE_HOST is "${host}".`,
    );
  }

  return {
    host,
    port: +process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: testDatabaseName(),
  };
}

// One database per Jest worker, so suites running in parallel never truncate each other's rows.
export function testDatabaseName(): string {
  return `${process.env.DATABASE_TEST_NAME || 'vic_test'}_${process.env.JEST_WORKER_ID ?? '1'}`;
}

async function ensureDatabase(
  options: ReturnType<typeof testConnectionOptions>,
): Promise<void> {
  const admin = new DataSource({
    type: 'postgres',
    host: options.host,
    port: options.port,
    username: options.user,
    password: options.password,
    database: 'postgres',
  });
  await admin.initialize();
  try {
    const rows = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [options.database],
    );
    if (!rows.length) {
      await admin.query(`CREATE DATABASE "${options.database}"`);
    }
  } finally {
    await admin.destroy();
  }
}

// Creates the test database if needed, applies every migration and returns a connected DataSource.
export async function createTestDataSource(): Promise<DataSource> {
  const options = testConnectionOptions();
  await ensureDatabase(options);

  const dataSource = new DataSource({
    type: 'postgres',
    host: options.host,
    port: options.port,
    username: options.user,
    password: options.password,
    database: options.database,
    entities: [`${__dirname}/../../src/**/*.entity.ts`],
    migrations: [`${__dirname}/../../src/migrations/*.ts`],
    synchronize: false,
  });

  await dataSource.initialize();
  await dataSource.runMigrations();

  return dataSource;
}

// Empties the tables a spec writes to; CASCADE also clears the rows that reference them.
export async function truncate(
  dataSource: DataSource,
  tables: string[],
): Promise<void> {
  await dataSource.query(
    `TRUNCATE ${tables.map((table) => `"${table}"`).join(', ')} CASCADE`,
  );
}
